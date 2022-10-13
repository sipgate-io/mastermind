import { randomInt } from 'crypto';
import * as dotenv from 'dotenv';
import express from 'express';
import { DatabaseEntry } from './DTMF_Controller';
import { Database } from './SQLITE_Controller';
import cors from 'cors';
import { bold } from 'colorette';

dotenv.config();

const token = process.env.API_TOKEN as string;
const dbFileName = process.env.DB_FILE_NAME as string;
const numberToCall = process.env.NUMBER_TO_CALL as string;

if (!token) {
	console.log('Missing API_TOKEN environment variable.');
	process.exit();
}

const app = express();
const PORT = 3002;
const DATABASE = new Database(dbFileName);

app.use((req, res, next) => {
	console.log(req.method, req.url);
	next();
});

app.use(cors({}));

app.use((req, res, next) => {
	const authorizationHeader = req.headers.authorization;
	if (authorizationHeader && authorizationHeader == `Bearer ${token}`) {
		next();
		return;
	}

	res.status(401).send('Incorrect bearer token\n');
});

app.get('/ranking', async (req, res) => {
	const entries = await DATABASE.getEntries();

	const anonymizedEntries = entries.map((entry) => ({
		...entry,
		usersTel: anonymizePhone(entry.usersTel),
	}));

	res.status(200).json(anonymizedEntries.sort(sortEntries));
});

app.get('/ranking/:number', async (req, res) => {
	const tel = req.params.number;

	if (tel.match(/^\+[1-9]\d{1,14}$/g)) {
		return res.status(400).send('Number does not match E.164 format');
	}

	const entries = await DATABASE.getEntries();

	const targetEntry = entries.find((x) => x.usersTel == tel);

	if (!targetEntry) {
		return res.status(404).send('Number not found.');
	}

	res.status(200).json({
		rank: entries.sort(sortEntries).indexOf(targetEntry) + 1,
		...targetEntry,
	});
});

app.post('/', (req, res) => {
	for (let i = 0; i < 100; i++) {
		DATABASE.addEntry({
			usersTel: '+49157' + randomInt(1000000) + 1,
			duration: randomInt(100),
			tries: randomInt(10) + 1,
			hasWon: randomInt(2),
		});
	}

	res.status(201).send();
});

app.get('/getNumberToCall', (req, res) => {
	res.status(200).send(numberToCall);
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
function anonymizePhone(number: string) {
	let publicDigits = number.substring(number.length - 4);
	return `+xx xxxx xxxx${publicDigits}`;
}
