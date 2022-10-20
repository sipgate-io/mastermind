import { bold, redBright, yellowBright } from 'colorette';
import {
	ERR_INVALID_DIGIT,
	GAME_LOST,
	GAME_STATUS,
	GAME_WON,
	ERR_NO_DUPLICATES,
	ERR_FILL_FULL,
} from './Messages';

export type Digit = 1 | 2 | 3 | 4 | 5 | 6;
export type MastermindGuess = [Digit, Digit, Digit, Digit];
type DigitEmpty = undefined;
type MastermindCurrentGuess = [
	Digit | DigitEmpty,
	Digit | DigitEmpty,
	Digit | DigitEmpty,
	Digit | DigitEmpty
];

/*
@rowNumbers: Array of guessed numbers
@correctNumbersRightPlace: Count of correct digits
@correctNumbersWrongPlace: Count of incorrect digits
 */
export interface MastermindRow {
	rowNumbers: MastermindGuess;
	correctNumbersRightPlace: number;
	correctNumbersWrongPlace: number;
}

interface GameResult {
	isWon: boolean;
	tries: number;
	duration: number;
}

export interface Pointer {
	row: number;
	column: number;
}

export class Mastermind {
	//pointer indicates the position of the current cell
	private pointer: Pointer = { row: 0, column: 0 };

	private isFinished = true;
	//padding describes the blanks between the console output
	private readonly padding = 2;
	//mastermindHeight and mastermindWidth describes the dimensions of the field
	private readonly mastermindHeight = 10;

	private readonly mastermindWidth = 4;

	private pastGuesses: MastermindRow[] = [];

	private gameResult: GameResult = { isWon: false, tries: 0, duration: 0 };
	//goal describes the numbers you need to guess and will be randomized
	private goal: MastermindGuess = [1, 1, 1, 1];

	private currentRow: MastermindCurrentGuess = [
		undefined,
		undefined,
		undefined,
		undefined,
	];

	//gameStart describes the time at which the game started
	private gameStart: number;

	private errorMessage: String = '';

	constructor() {
		this.isFinished = false;
		this.gameStart = Date.now();
		this.setGameGoal(this.mastermindWidth);
	}

	enterDigit(digit: Digit) {
		if (this.isGameFinished()) return;
		if ('123456'.indexOf(digit.toString()) !== -1) {
			if (this.currentRow.indexOf(digit) !== -1) {
				this.currentRow[this.currentRow.indexOf(digit)] = undefined;
			}
			this.currentRow[this.pointer.column] = digit;
			this.movePointerColumn();
			this.errorMessage = '';
		} else {
			this.errorMessage = ERR_INVALID_DIGIT;
		}
	}

	private isValidInput() {
		let isValid = true;
		this.currentRow.forEach((digit) => {
			if (digit === undefined) isValid = false;
		});
		return isValid;
	}

	private compareWithGoal(guess: MastermindGuess) {
		//In a goal duplicate digits are NOT allowed, which is why we don't consider them

		let rightNumberRightPlace = 0;
		let rightNumberWrongPlace = 0;

		guess.forEach((digit, index) => {
			let indexInGoal = this.goal.indexOf(digit);
			if (indexInGoal === -1) {
				// Digit does not exist in goal
			} else if (indexInGoal === index) {
				rightNumberRightPlace++;
			} else {
				rightNumberWrongPlace++;
			}
		});

		return {
			rightNumberRightPlace,
			rightNumberWrongPlace,
		};
	}

	submit() {
		if (this.isGameFinished()) return;
		if (this.isValidInput()) {
			this.errorMessage = '';
			this.pointer.column = 0;

			// der Input ist gültig
			let result = this.compareWithGoal(this.currentRow as MastermindGuess);
			let newRow: MastermindRow = {
				rowNumbers: this.currentRow as MastermindGuess,
				correctNumbersRightPlace: result.rightNumberRightPlace,
				correctNumbersWrongPlace: result.rightNumberWrongPlace,
			};
			this.pastGuesses.push(newRow);
			if (newRow.correctNumbersRightPlace === this.mastermindWidth) {
				// player wins
				this.finishGame(true);
			} else if (this.pointer.row === this.mastermindHeight - 1) {
				//player lose
				this.finishGame(false);
			} else {
				this.movePointerRow();
			}
			this.currentRow = [undefined, undefined, undefined, undefined];
		} else {
			this.errorMessage = ERR_FILL_FULL;
		}
	}

	movePointerColumn() {
		if (this.isGameFinished()) return;
		if (this.pointer.column < this.mastermindWidth - 1) {
			this.pointer.column++;
		} else {
			this.pointer.column = 0;
		}
	}

	private movePointerRow() {
		this.pointer.row < this.mastermindHeight - 1 ? this.pointer.row++ : null;
	}

	private finishGame(hasWon: boolean) {
		this.isFinished = true;
		this.gameResult = {
			isWon: hasWon,
			duration: Date.now() - this.gameStart,
			tries: this.pointer.row + 1,
		};
	}

	getGameResult() {
		return this.gameResult;
	}

	isGameFinished() {
		return this.isFinished;
	}

	// Creates an empty string with num blanks
	private genPadding(num: number) {
		let str = '';
		for (let i = 0; i < num; i++) {
			str += ' ';
		}
		return str;
	}

	//prints mastermind to console
	printMastermind() {
		for (let i = 0; i < this.mastermindHeight; i++) {
			let str =
				this.genPadding(this.padding) +
				(this.pointer.row === i ? bold(redBright('>')) : ' ') +
				this.genPadding(this.padding + (i + 1 < 10 ? 1 : 0));

			str += i + 1 + '.' + this.genPadding(this.padding);

			if (this.pastGuesses[i]) {
				str += this.printRow(this.pastGuesses[i]);
				console.log(str);
			} else if (this.pointer.row === i) {
				str += this.printCurrentRow();
				let newLine = this.genPadding(2 * this.padding + 1 + 3 + this.padding);
				newLine += this.genPadding(this.pointer.column * (this.padding + 1));
				newLine += bold(redBright('^'));

				console.log(str);
				console.log(newLine);
			} else {
				console.log(str);
			}
		}
		if (this.isGameFinished()) {
			let durationSeconds = Math.round(this.gameResult.duration / 1000);

			console.log('\n');

			if (this.gameResult.isWon) {
				console.log(GAME_WON);
			} else {
				console.log(GAME_LOST);
			}

			console.log(GAME_STATUS(this.gameResult.tries, durationSeconds));
		}

		console.log(this.errorMessage);

		return {
			mastermindHeight: this.mastermindHeight,
			mastermindWidth: this.mastermindWidth,
			currentRow: this.currentRow,
			pastGuesses: this.pastGuesses,
			gameResult: this.gameResult,
			errorMessage: this.errorMessage,
			pointer: this.pointer,
		};
	}

	private printCurrentRow() {
		let temp: String = '';
		this.currentRow.forEach((digit) => {
			if (digit === undefined) {
				temp += '-';
			} else {
				temp += bold(digit.toString());
			}
			temp += this.genPadding(this.padding);
		});
		temp += bold(yellowBright(` [?] `));
		temp += bold(yellowBright(`(?)`));
		return temp;
	}

	private printRow(row: MastermindRow) {
		let temp: String = '';
		row.rowNumbers.forEach((data) => {
			temp += bold(data.toString() + this.genPadding(this.padding));
		});
		temp += bold(yellowBright(` [${row.correctNumbersRightPlace}] `));
		temp += bold(yellowBright(`(${row.correctNumbersWrongPlace})`));
		return temp;
	}

	//Initiate the goal with random numbers
	private setGameGoal(mastermindWidth: number) {
		for (let i = 0; i < mastermindWidth; i++) {
			let rndDigit = this.genRandomDigit();
			while (this.goal.indexOf(rndDigit) !== -1) {
				rndDigit = this.genRandomDigit();
			}
			this.goal[i] = rndDigit;
		}
	}

	private genRandomDigit() {
		return Math.floor(Math.random() * 6 + 1) as Digit;
	}
}
