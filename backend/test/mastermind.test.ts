//mock code eingabe in spiel klasse eingeben und schauen, ob das erwartete herauskommt.
//input => user eingegebenen code & richtigen code

// mastermind objekt eingeben (zb 1234, und #) und schauen ob zb Pointer heruntergesetzt wurde
// mastermind objekt erstellen und überschreiben den rnd generierten code mit einem eigenen, dieser wird getestet

import {
	describe,
	expect,
	test,
	jest,
	beforeEach,
	afterEach,
} from '@jest/globals';
import { MockInstance } from 'jest-mock';
import { NewCallEvent, HangUpEvent, ResponseObject } from 'sipgateio';
import { DataEvent, GatherObject, HangUpObject } from 'sipgateio/dist/webhook';
import { DatabaseEntry, DTMF_Controller } from '../src/DTMF_Controller';
import { MastermindGuess, MastermindRow, Pointer } from '../src/Mastermind';
import {
	EXPLANATION_TEXT,
	GAME_WON,
	ERR_NO_DUPLICATES,
	SHORT_EXPLANATION_TEXT,
	ERR_INVALID_DIGIT,
	THANK_YOU,
	GAME_LOST,
	ERR_FILL_FULL,
} from '../src/Messages';
import { Database } from '../src/SQLITE_Controller';

function isHangUpObject(
	value: HangUpObject | GatherObject
): value is HangUpObject {
	return (value as HangUpObject).Hangup !== undefined;
}

function isGatherObject(
	value: HangUpObject | GatherObject
): value is GatherObject {
	return (value as GatherObject).Gather !== undefined;
}

function wait(time: number) {
	return new Promise<void>((resolve) => {
		setTimeout(() => {
			resolve();
		}, time);
	});
}

describe('DTMF Controller', () => {
	let dtmfController: DTMF_Controller;
	let consoleLogMock: MockInstance;

	beforeEach(() => {
		const numberToCall = '123';
		consoleLogMock = jest
			.spyOn(console, 'log')
			.mockImplementation((message) => {});
		const consoleClearMock = jest
			.spyOn(console, 'clear')
			.mockImplementation(() => {});

		dtmfController = new DTMF_Controller(numberToCall, ':memory:');
	});

	afterEach(() => {
		consoleLogMock.mockRestore();
		dtmfController.quit();
	});

	test('accepts first call', async () => {
		const newCallEvent: NewCallEvent = {
			from: '0123',
		} as NewCallEvent;

		let response = await dtmfController.newCall(newCallEvent);

		expect(isGatherObject(response)).toBe(true);
		expect(consoleLogMock).toBeCalledWith(EXPLANATION_TEXT);

		dtmfController.quit();
	});

	test('rejects while in call', async () => {
		const newCallEvent: NewCallEvent = {
			from: '0123',
		} as NewCallEvent;

		const dataEvent: DataEvent = {
			dtmf: '1',
			callId: '0',
		} as DataEvent;

		await dtmfController.newCall(newCallEvent);
		const response = await dtmfController.newCall(newCallEvent);
		expect(isGatherObject(response)).toBe(true);
		const dataResponse = await dtmfController.onData(dataEvent);
		expect(isHangUpObject(dataResponse)).toBe(true);
	});

	test('rejects caller from database', async () => {
		dtmfController['database'].addEntry('0123');

		const newCallEvent: NewCallEvent = {
			from: '0123',
		} as NewCallEvent;

		const dataEvent: DataEvent = {
			dtmf: '1',
			callId: '0',
		} as DataEvent;

		await dtmfController.newCall(newCallEvent);
		const response = await dtmfController.newCall(newCallEvent);
		expect(isGatherObject(response)).toBe(true);
		const dataResponse = await dtmfController.onData(dataEvent);
		expect(isHangUpObject(dataResponse)).toBe(true);
	});

	test('close database', async () => {
		dtmfController['database'].closeDB();

		expect(await dtmfController['database'].getEntriesForHighscore()).toBe(
			undefined
		);
	});

	test('handles full row', async () => {
		const newCallEvent: NewCallEvent = {
			from: '0123',
		} as NewCallEvent;

		const input = [1, 2, 3, 4];

		await dtmfController.newCall(newCallEvent);
		await dtmfController.onData({ dtmf: '1' } as unknown as DataEvent);
		await dtmfController.onData({ dtmf: '1' } as unknown as DataEvent);

		for (const val of input) {
			await dtmfController.onData({
				dtmf: val.toString(),
			} as unknown as DataEvent);
		}

		expect(dtmfController['mastermind']['currentRow']).toEqual(input);
	});

	test("doesn't accept row with duplicates", async () => {
		const newCallEvent: NewCallEvent = {
			from: '0123',
		} as NewCallEvent;

		const input = [1, 2, 3, 2];
		const output = [1, undefined, 3, 2];

		await dtmfController.newCall(newCallEvent);
		await dtmfController.onData({ dtmf: '1' } as unknown as DataEvent);
		await dtmfController.onData({ dtmf: '1' } as unknown as DataEvent);

		for (const val of input) {
			await dtmfController.onData({
				dtmf: val.toString(),
			} as unknown as DataEvent);
		}

		expect(dtmfController['mastermind']['currentRow']).toEqual(output);
	});

	test('move pointer with *', async () => {
		const newCallEvent: NewCallEvent = {
			from: '0123',
		} as NewCallEvent;

		await dtmfController.newCall(newCallEvent);
		await dtmfController.onData({ dtmf: '1' } as unknown as DataEvent);
		await dtmfController.onData({ dtmf: '1' } as unknown as DataEvent);

		expect(dtmfController['mastermind']['pointer'].column).toBe(0);

		for (let i = 0; i < 5; i++) {
			await dtmfController.onData({ dtmf: '*' } as unknown as DataEvent);
			expect(dtmfController['mastermind']['pointer'].column).toBe((i + 1) % 4);
		}
	});

	test('submit incorrect row', async () => {
		const newCallEvent: NewCallEvent = {
			from: '0123',
		} as NewCallEvent;

		const goal: MastermindGuess = [1, 2, 3, 4];
		const input: MastermindGuess = [1, 2, 4, 5];

		await dtmfController.newCall(newCallEvent);
		await dtmfController.onData({ dtmf: '1' } as unknown as DataEvent);
		await dtmfController.onData({ dtmf: '1' } as unknown as DataEvent);

		dtmfController['mastermind']['goal'] = goal;

		for (const val of input) {
			await dtmfController.onData({
				dtmf: val.toString(),
			} as unknown as DataEvent);
		}

		await dtmfController.onData({ dtmf: '#' } as unknown as DataEvent);

		expect(dtmfController['mastermind']['pointer']).toEqual({
			column: 0,
			row: 1,
		} as Pointer);

		expect(dtmfController['mastermind']['currentRow']).toEqual([
			undefined,
			undefined,
			undefined,
			undefined,
		]);

		expect(dtmfController['mastermind']['pastGuesses'][0]).toEqual({
			rowNumbers: input,
			correctNumbersRightPlace: 2,
			correctNumbersWrongPlace: 1,
		} as MastermindRow);

		expect(dtmfController['mastermind'].isGameFinished()).toBe(false);
	});

	test('ignores ASCII 0', async () => {
		const newCallEvent: NewCallEvent = {
			from: '0123',
		} as NewCallEvent;

		await dtmfController.newCall(newCallEvent);
		await dtmfController.onData({ dtmf: '\0' } as unknown as DataEvent);

		expect(consoleLogMock).not.toBeCalledWith(SHORT_EXPLANATION_TEXT);
	});

	test('hang up on -1', async () => {
		const newCallEvent: NewCallEvent = {
			from: '0123',
		} as NewCallEvent;

		await dtmfController.newCall(newCallEvent);

		let response = await dtmfController.onData({
			dtmf: '-1',
		} as unknown as DataEvent);
		expect(isHangUpObject(response)).toBe(true);
	});

	test('submit correct row and win the game', async () => {
		const newCallEvent: NewCallEvent = {
			from: '0123',
		} as NewCallEvent;

		const goal: MastermindGuess = [1, 2, 3, 4];
		const input: MastermindGuess = [1, 2, 3, 4];

		await dtmfController.newCall(newCallEvent);
		await dtmfController.onData({ dtmf: '1' } as unknown as DataEvent);
		await dtmfController.onData({ dtmf: '1' } as unknown as DataEvent);

		dtmfController['mastermind']['goal'] = goal;

		for (const val of input) {
			await dtmfController.onData({
				dtmf: val.toString(),
			} as unknown as DataEvent);
		}

		await dtmfController.onData({ dtmf: '#' } as unknown as DataEvent);

		let winningEntry: DatabaseEntry = (
			await dtmfController['database'].getEntriesForHighscore()
		)[0];

		expect(winningEntry).toEqual({
			usersTel: '0123',
			duration: winningEntry.duration,
			score: winningEntry.score,
			tries: 1,
			hasWon: 1,
		});

		expect(dtmfController['mastermind'].isGameFinished()).toBe(true);
	});

	test("doesn't accept numbers above 6", async () => {
		const newCallEvent: NewCallEvent = {
			from: '0123',
		} as NewCallEvent;

		const input = [4, 7, 1, 9];
		const output = [4, 1, undefined, undefined];

		await dtmfController.newCall(newCallEvent);
		await dtmfController.onData({ dtmf: '1' } as unknown as DataEvent);
		await dtmfController.onData({ dtmf: '1' } as unknown as DataEvent);

		for (const val of input) {
			await dtmfController.onData({
				dtmf: val.toString(),
			} as unknown as DataEvent);
		}

		expect(consoleLogMock).toBeCalledWith(ERR_INVALID_DIGIT);

		expect(dtmfController['mastermind']['currentRow']).toEqual(output);
	});

	test('detect hang up after interval', async () => {
		const newCallEvent: NewCallEvent = {
			from: '0123',
		} as NewCallEvent;

		clearInterval(dtmfController['hangUpDetectionInterval']);

		await dtmfController.newCall(newCallEvent);
		await dtmfController.onData({ dtmf: '1' } as unknown as DataEvent);
		await dtmfController.onData({ dtmf: '1' } as unknown as DataEvent);

		dtmfController['hangUpDetectionInterval'] =
			dtmfController['hangUpInterval'](1500);

		await wait(1100);
		expect(consoleLogMock).not.toBeCalledWith(THANK_YOU);
		await wait(1100);
		expect(consoleLogMock).toBeCalledWith(THANK_YOU);
	});

	test('loses game after 10 wrong guesses', async () => {
		const newCallEvent: NewCallEvent = {
			from: '0123',
		} as NewCallEvent;

		const input = [1, 2, 3, 4];
		const goal: MastermindGuess = [4, 3, 2, 1];

		await dtmfController.newCall(newCallEvent);
		await dtmfController.onData({ dtmf: '1' } as unknown as DataEvent);
		await dtmfController.onData({ dtmf: '1' } as unknown as DataEvent);

		for (let i = 0; i < 10; i++) {
			for (const val of input) {
				await dtmfController.onData({
					dtmf: val.toString(),
				} as unknown as DataEvent);
			}
			await dtmfController.onData({ dtmf: '#' } as unknown as DataEvent);
		}

		expect(consoleLogMock).toBeCalledWith(GAME_LOST);
	});

	test('does not fully fill row', async () => {
		const newCallEvent: NewCallEvent = {
			from: '0123',
		} as NewCallEvent;

		await dtmfController.newCall(newCallEvent);
		await dtmfController.onData({ dtmf: '1' } as unknown as DataEvent);
		await dtmfController.onData({ dtmf: '1' } as unknown as DataEvent);

		await dtmfController.onData({ dtmf: '4' } as unknown as DataEvent);

		await dtmfController.onData({ dtmf: '#' } as unknown as DataEvent);

		expect(consoleLogMock).toBeCalledWith(ERR_FILL_FULL);
	});

	test('rejects anonymous caller', async () => {
		const newCallEvent: NewCallEvent = {
			from: 'anonymous',
		} as NewCallEvent;

		const dataEvent: DataEvent = {
			dtmf: '1',
			callId: '0',
		} as DataEvent;

		await dtmfController.newCall(newCallEvent);
		const response = await dtmfController.newCall(newCallEvent);
		expect(isGatherObject(response)).toBe(true);
		const dataResponse = await dtmfController.onData(dataEvent);
		expect(isHangUpObject(dataResponse)).toBe(true);
	});
});

// komplette richtige Zeile eingeben (pastGuesses)
// Ziffer über 6 eingeben
