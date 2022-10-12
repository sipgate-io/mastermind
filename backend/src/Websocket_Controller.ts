//const websocketServer = require('websocket').server
const webSocketsServerPort = '8000';
//const http = require("http");

import * as websocketServer from 'websocket';
import http from 'http';

const server = http.createServer();

// I'm maintaining all active connections in this object
const clients: any = {};
let usersWatching = 0;

export function getClients() {
	return clients;
}

export let getUsersWatching = () => usersWatching;

export function sendMessage(json: string) {
	// We are sending the current data to all connected clients
	Object.keys(clients).map((client) => {
		clients[client].sendUTF(json);
	});
}

export function buildMessageJson(type: string, message: string) {
	return JSON.stringify({
		type: type,
		message: message,
	});
}

export function runWebsocket() {
	server.listen(webSocketsServerPort, () => {
		console.log('WebsocketServer listening on Port: ' + webSocketsServerPort);
	});
	const wsServer = new websocketServer.server({
		httpServer: server,
	});

	// I'm maintaining all active connections in this object

	// This code generates unique userid for everyuser.
	const getUniqueID = () => {
		const s4 = () =>
			Math.floor((1 + Math.random()) * 0x10000)
				.toString(16)
				.substring(1);
		return s4() + s4() + '-' + s4();
	};

	wsServer.on('request', function (request) {
		const userID = getUniqueID();
		console.log(
			new Date() +
				' Recieved a new connection from origin ' +
				request.origin +
				'.'
		);
		// You can rewrite this part of the code to accept only the requests from allowed origin
		const connection = request.accept(null, request.origin);
		clients[userID] = connection;
		console.log(
			'connected: ' + userID + ' in ' + Object.getOwnPropertyNames(clients)
		);
		clients[userID].sendUTF(
			buildMessageJson('log', 'Your are now connected with webSocketServer')
		);

		connection.on('close', function () {
			console.log(new Date() + ' Peer ' + userID + ' disconnected.');
			delete clients[userID];
		});
	});
}
