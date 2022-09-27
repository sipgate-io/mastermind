import { randomInt } from 'crypto';
import * as dotenv from 'dotenv';
import express from 'express';
import { DatabaseEntry } from './DTMF_Controller';
import { Database } from './SQLITE_Controller';

dotenv.config();

const dbFileName = process.env.DB_FILE_NAME as string;

const app = express();
const PORT = 8080;
const DATABASE = new Database(dbFileName);

app.use((req, res, next) => {
	console.log(req.method, req.url);
	next();
});

app.get('/entries', async (req, res) => {
	const entries = await DATABASE.getEntries();

	res.status(200).json(entries.sort(sortEntries));
});

app.get('/rank/:number', async (req, res) => {
	const tel = req.params.number;

	var entries = await DATABASE.getEntries();

	const targetEntry = entries.find((x) => x.usersTel == tel);

	if (!targetEntry) {
		res.status(404).send();
		return;
	}

	res.status(200).json({
		rank: entries.sort(sortEntries).indexOf(targetEntry) + 1,
		...targetEntry,
	});
});

app.post('/', (req, res) => {
	for (let i = 0; i < 100; i++) {
		DATABASE.addEntry({
			usersTel: randomInt(10).toString(),
			duration: randomInt(100),
			tries: randomInt(10) + 1,
			hasWon: randomInt(2),
		});
	}

	res.status(200).send();
});

app.listen(PORT, () => {
	console.log(`server started at http://localhost:${PORT}`);
});

function sortEntries(a: DatabaseEntry, b: DatabaseEntry) {
	// Keiner hat gewonnen
	if (!(a.hasWon || b.hasWon)) return 0;

	// Beide haben gewonnen
	if (a.hasWon && b.hasWon) {
		if (a.tries != b.tries) return a.tries - b.tries;

		return a.duration - b.duration;
	}

	// Einer hat gewonnen
	if (a.hasWon) return -1;
	return 1;
}
