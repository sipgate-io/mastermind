import { bgBlack, blue, bold } from 'colorette';
import { Digit, Mastermind } from './Mastermind';
import {
	ANNOUNCEMENT_COMPLETE_TEXT,
	CALLING_NUMBER,
	CALL_TEXT,
	EXPLANATION_TEXT,
	MASTERMIND_LOGO,
	SHORT_EXPLANATION_TEXT,
	THANK_YOU,
	WELCOME_TEXT,
} from './Messages';
import { Database } from './SQLITE_Controller';
import { DataEvent, NewCallEvent, WebhookResponse } from 'sipgateio';
import { GatherOptions } from 'sipgateio/dist/webhook';
import { buildMessageJson, sendMessage } from './Websocket_Controller';

const WELCOME_AUDIO_URL =
	'https://raw.githubusercontent.com/sipgate-io/mastermind/main/backend/assets/welcomeMessage.wav';
const ALREADY_IN_GAME_AUDIO_URL =
	'https://raw.githubusercontent.com/sipgate-io/mastermind/main/backend/assets/alreadyInGame.wav';
const CANT_PLAY_AGAIN_AUDIO_URL =
	'https://raw.githubusercontent.com/sipgate-io/mastermind/main/backend/assets/cantPlayAgain.wav';
const SUPPRESSED_NUMBER_AUDIO_URL =
	'https://raw.githubusercontent.com/sipgate-io/mastermind/main/backend/assets/suppressedNumber.wav';
const PING_AUDIO_URL =
	'https://raw.githubusercontent.com/sipgate-io/mastermind/main/backend/assets/ping.wav';

/**
 * Represents an entry in the database.
 */
export interface DatabaseEntry {
	usersTel: string;
	duration: number;
	tries: number;
	hasWon: number;
	score: number;
}

enum CallerState {
	WAITING_CONSENT,
	WAITING_RULES,
}

/**
 * A controller that accepts DTMF events and controls a mastermind game instance.
 */
export class DTMF_Controller {
	// isPlaying is true, when the game is running and false while the audio introduction is played
	private isPlaying;

	private callerState: CallerState;
	// isCalling is true, when a phone number is currently playing the game
	// a new player will not be accepted while isCalling is true
	private isCalling;

	// the time of the last DTMF event, in ms
	private lastDTMFEvent = 0;

	// a reference to the timeout that prints a good-bye message
	private goodByeTimeout: NodeJS.Timeout | undefined;

	// a reference to the interval that periodically checks if a caller has hung up
	private hangUpDetectionInterval: NodeJS.Timer;

	// the last time audio has been played during the current call
	private lastTime = 0;

	private mastermind: Mastermind;
	private usersTel: string;
	private currentCallId: string;
	private readonly database: Database;

	private readonly WELCOME_AUDIO_LENGTH = 25000;
	private readonly REMINDER_AUDIO_LENGTH = 1000;
	private readonly NUMBER_TO_CALL: string;

	/**
	 * @param numberToCall the number that is listening for calls
	 * @param fileName the name of the SQLite database
	 */
	constructor(numberToCall: string, fileName: string) {
		this.isPlaying = false;
		this.isCalling = false;
		this.mastermind = new Mastermind();
		this.database = new Database(fileName);
		this.usersTel = '';
		this.currentCallId = '';
		this.NUMBER_TO_CALL = numberToCall;
		this.hangUpDetectionInterval = this.hangUpInterval(
			this.REMINDER_AUDIO_LENGTH + 5000
		);
		this.printLogo(numberToCall);
		this.callerState = CallerState.WAITING_CONSENT;
	}

	/**
	 * process a newCall event
	 * @param newCallEvent the incoming event
	 * @returns a Promise that resolves to a WebhookResponse after the handler has finished
	 */
	async newCall(newCallEvent: NewCallEvent) {
		// don't accept a new call when a player is already playing the game,
		// or when the caller has already played
		if (this.isCalling) {
			return WebhookResponse.gatherDTMF({
				maxDigits: 1,
				timeout: 900,
				announcement: ALREADY_IN_GAME_AUDIO_URL,
			});
		}
		if (newCallEvent.from === 'anonymous') {
			return WebhookResponse.gatherDTMF({
				maxDigits: 1,
				timeout: 900,
				announcement: SUPPRESSED_NUMBER_AUDIO_URL,
			});
		}
		if (await this.callerHasPlayed(newCallEvent.from)) {
			return WebhookResponse.gatherDTMF({
				maxDigits: 1,
				timeout: 900,
				announcement: CANT_PLAY_AGAIN_AUDIO_URL,
			});
		}

		this.usersTel = newCallEvent.from;
		this.currentCallId = newCallEvent.callId;
		this.isCalling = true;
		this.isPlaying = false;

		this.database.addEntry(this.usersTel);
		sendMessage(buildMessageJson('newCall', ''));

		clearTimeout(this.goodByeTimeout);

		console.log(WELCOME_TEXT(this.usersTel));
		console.log(EXPLANATION_TEXT);
		console.log(ANNOUNCEMENT_COMPLETE_TEXT);

		this.lastTime = Date.now() + this.WELCOME_AUDIO_LENGTH;
		this.lastDTMFEvent = Date.now() + this.WELCOME_AUDIO_LENGTH;
		this.callerState = CallerState.WAITING_CONSENT;
		return WebhookResponse.gatherDTMF({
			maxDigits: 1,
			timeout: 900,
			announcement: WELCOME_AUDIO_URL,
		});
	}

	/**
	 * process a data event
	 * @param data the incoming event
	 * @returns a Promise that resolves to a WebhookResponse after the handler has finished
	 */
	async onData(data: DataEvent) {
		if (this.currentCallId !== data.callId) {
			return WebhookResponse.hangUpCall();
		}
		this.lastDTMFEvent = Date.now();

		// a -1 indicates, that the player has hung up while an announcement was playing
		if (data.dtmf === '-1') {
			this.userHungUp();
			return WebhookResponse.hangUpCall();
		}

		if (this.isPlaying) {
			this.handleInput(data.dtmf);
		} else {
			if (data.dtmf === '*') {
				if (this.callerState === CallerState.WAITING_CONSENT) {
					this.callerState = CallerState.WAITING_RULES;
					sendMessage(buildMessageJson('consentAccepted', ''));
				} else if (this.callerState === CallerState.WAITING_RULES) {
					this.mastermind = new Mastermind();
					this.isPlaying = true;

					sendMessage(buildMessageJson('rulesAccepted', ''));
				}
			} else {
				// collect more DTMF events until the playes presses a key
				return WebhookResponse.gatherDTMF(this.gatherDTMFResponse());
			}
		}

		console.clear();
		console.log(CALLING_NUMBER(this.usersTel));
		console.log(SHORT_EXPLANATION_TEXT);

		sendMessage(
			buildMessageJson(
				'gameData',
				JSON.stringify(this.mastermind.printMastermind())
			)
		);

		// save the result and hang up the call when the game is finished
		if (this.mastermind.isGameFinished()) {
			await this.finishGame();
			return WebhookResponse.hangUpCall();
		} else {
			// if the game isn't finished, we need to listen for more DTMF events
			return WebhookResponse.gatherDTMF(this.gatherDTMFResponse());
		}
	}

	/**
	 * starts an interval that checks if the caller has hung up
	 * @param totalLength the time after a DTMF event when the call should be considered hung up
	 * @returns a reference to the started interval
	 */
	private hangUpInterval(totalLength: number) {
		return setInterval(() => {
			let difference = Date.now() - this.lastDTMFEvent;
			if (this.isCalling && difference > totalLength) {
				this.userHungUp();
			}
		}, 1000);
	}

	/**
	 * clears the internal timeout and interval
	 */
	quit() {
		clearInterval(this.hangUpDetectionInterval);
		clearTimeout(this.goodByeTimeout);
	}

	/**
	 * shows the logo after 5 seconds
	 */
	private goodBye() {
		clearTimeout(this.goodByeTimeout);
		this.goodByeTimeout = setTimeout(() => {
			this.printLogo(this.NUMBER_TO_CALL);
		}, 5000);
	}

	/**
	 * @param numberToCall the number that should be shown on the console
	 */
	private printLogo(numberToCall: string) {
		console.clear();
		console.log(bold(bgBlack(blue(MASTERMIND_LOGO))));
		console.log('');
		console.log(CALL_TEXT(numberToCall));
		console.log('');
	}

	/**
	 * Save the GameResult in the database and reset the controller to accept a new call.
	 */
	private async finishGame() {
		const result = this.mastermind.getGameResult();
		this.database.updateEntry({
			usersTel: this.usersTel,
			duration: result.duration,
			tries: result.tries,
			hasWon: result.isWon ? 1 : 0,
			score: result.score,
		});

		const entries = await this.database.getEntriesForHighscore();
		let position = -1;

		for (let i = 0; i < entries.length; i++) {
			if (entries[i].usersTel === this.usersTel) {
				position = i + 1;
				break;
			}
		}

		sendMessage(
			buildMessageJson(
				'gameFinished',
				JSON.stringify({
					tries: result.tries,
					duration: result.duration,
					hasWon: result.isWon,
					position: position,
					score: result.score,
				})
			)
		);

		this.isCalling = false;
		this.isPlaying = false;

		this.goodBye();
	}

	/**
	 * build a GatherObject
	 * @returns the created GatherObject
	 */
	private gatherDTMFResponse() {
		// some phones hang up the call when no sounds are detected
		// to prevent this we play a short sounds every 20 seconds
		let responseObj: GatherOptions = {
			maxDigits: 1,
			timeout: 900,
		};
		if (Date.now() - this.lastTime > 20 * 1000) {
			this.lastTime = Date.now();
			responseObj.announcement = PING_AUDIO_URL;
		}
		return responseObj;
	}

	/**
	 * Handles the DTMF input and maps them to game commands.
	 * @param data the character the user has typed
	 */
	private handleInput(data: string) {
		if (data.length === 1 && '0123456789'.includes(data)) {
			this.mastermind.enterDigit(parseInt(data) as Digit);
		}
		if (data === '*') {
			this.mastermind.movePointerColumn();
		}
		if (data === '#') {
			this.mastermind.submit();
		}
	}

	/**
	 * print a thank you message and reset the controller to accept a new call.
	 */
	private userHungUp() {
		sendMessage(buildMessageJson('userHungUp', ''));

		console.clear();
		console.log(THANK_YOU);
		this.goodBye();
		this.isCalling = false;
		this.isPlaying = false;
	}

	/**
	 * check whether or not a caller has played the game alrady
	 * @param usersTel the phone number to check
	 * @returns a boolean that is true if the caller has played
	 */
	private async callerHasPlayed(usersTel: string) {
		const dbEntrys = await this.database.getEntries();
		const pastGames = dbEntrys.filter((row) => row.usersTel === usersTel);
		return pastGames.length > 0;
	}
}
