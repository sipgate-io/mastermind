import {
	createSettingsModule,
	createWebhookModule,
	sipgateIO,
} from 'sipgateio';
import * as ngrok from 'ngrok';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { DTMF_Controller } from './DTMF_Controller';

// load the .env file as environment variables
dotenv.config();

// prompt the user to press Enter and block until the Enter key has been pressed
function waitForEnter() {
	console.log('Drücke Enter wenn das Softphone bereit bist.');

	let _inputBuffer = Buffer.alloc(1);
	fs.readSync(0, _inputBuffer, 0, 1, null);
}

// read the variables from the environment
const numberToCall = process.env.NUMBER_TO_CALL as string;
const patToken = process.env.PAT_TOKEN as string;
const patTokenId = process.env.PAT_TOKEN_ID as string;
const ngrokToken = process.env.NGROK_AUTH_TOKEN as string;
const portString = process.env.PORT as string;
const dbFileName = process.env.DB_FILE_NAME as string;

// exit the script if a required environment variable isn't set
if (
	!numberToCall ||
	!patToken ||
	!patTokenId ||
	!ngrokToken ||
	!portString ||
	!dbFileName ||
	parseInt(portString) === NaN
) {
	console.log('Fehlende oder ungültige Umgebungsvariablen.');

	process.exit();
}

(async function () {
	const serverAddress = await initWebhook();

	// prompt the user to start the sipgate Softphone
	console.log(
		'Bitte starte das Softphone für die Nummer ' + numberToCall + '.'
	);
	waitForEnter();

	await startDTMF(numberToCall, parseInt(portString), serverAddress);
})();

// connect with ngrok and configure the assigned URL as sipgate webhook URLs
async function initWebhook() {
	await ngrok.authtoken(ngrokToken);
	const serverAddress = await ngrok.connect({
		addr: parseInt(portString),
		region: 'eu',
	});

	const client = sipgateIO({
		token: patToken,
		tokenId: patTokenId,
	});
	const settings = createSettingsModule(client);

	await settings.setIncomingUrl(serverAddress);
	await settings.setOutgoingUrl(serverAddress);

	return serverAddress;
}

// start a webhook server that uses the DTMF controller
async function startDTMF(
	numberToCall: string,
	port: number,
	serverAddress: string
) {
	const webhookModule = createWebhookModule();
	webhookModule
		.createServer({
			port,
			serverAddress,
			skipSignatureVerification: true,
		})
		.then((webhookServer) => {
			let dtmfController = new DTMF_Controller(numberToCall, dbFileName);
			webhookServer.onNewCall((newCallEvent) =>
				dtmfController.newCall(newCallEvent)
			);
			webhookServer.onData((dataEvent) => dtmfController.onData(dataEvent));
		});
}
