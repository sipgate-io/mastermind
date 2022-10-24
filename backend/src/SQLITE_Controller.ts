import * as sqlite3 from 'sqlite3';
import { DatabaseEntry } from './DTMF_Controller';

/**
 * this class provides functions to save and read past games
 */
export class Database {
	private db: sqlite3.Database;

	/**
	 * @param fileName the file name of the SQLite database
	 */
	constructor(fileName: string) {
		this.db = new sqlite3.Database(fileName);
		this.init();
	}

	/**
	 * initialize the database and create a new table if none exists
	 */
	private init() {
		this.db.serialize(() => {
			this.db.run(
				'CREATE TABLE IF NOT EXISTS games (usersTel Text, duration Integer, tries Integer, hasWon Integer)'
			);
		});
	}

	/**
	 * @returns a list of all entries in the database of won games
	 */
	getEntriesForHighscore() {
		return new Promise<DatabaseEntry[]>((resolve) => {
			this.db.all(
				'SELECT * FROM games WHERE hasWon = 1 ORDER BY tries ASC, duration ASC',
				(err, rows) => {
					resolve(rows);
				}
			);
		});
	}
	/**
	 * @returns a list of all entries in the database
	 */
	getEntries() {
		return new Promise<DatabaseEntry[]>((resolve) => {
			this.db.all('SELECT * FROM games', (err, rows) => {
				resolve(rows);
			});
		});
	}

	/**
	 * add a new entry to the database
	 * @param usersTel the callers number to add in db
	 */
	addEntry(usersTel: string) {
		const stmt = this.db.prepare('INSERT INTO games (usersTel) VALUES (?)');
		stmt.run(usersTel);
		stmt.finalize();
	}

	updateEntry(entry: DatabaseEntry) {
		const stmt = this.db.prepare(
			'UPDATE games SET duration = (?), tries = (?), hasWon= (?) WHERE usersTel = (?)'
		);
		stmt.run(entry.duration, entry.tries, entry.hasWon, entry.usersTel);
		stmt.finalize();
	}

	closeDB() {
		this.db.close();
	}
}
