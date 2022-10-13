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
	 * @returns a list of all entries in the database
	 */
	getEntries() {
		return new Promise<DatabaseEntry[]>((resolve) => {
			this.db.all('SELECT * FROM games WHERE hasWon = 1', (err, rows) => {
				resolve(rows);
			});
		});
	}

	/**
	 * add a new entry to the database
	 * @param entry the new entry to add
	 */
	addEntry(entry: DatabaseEntry) {
		const stmt = this.db.prepare(
			'INSERT INTO games (usersTel, duration, tries, hasWon) VALUES (?,?,?,?)'
		);
		stmt.run(entry.usersTel, entry.duration, entry.tries, entry.hasWon);
		stmt.finalize();
	}

	closeDB() {
		this.db.close();
	}
}