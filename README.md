# Mastermind

## Setup

1. Install dependencies in `/backend` and `/frontend` with `npm install`.
2. Compile the project in `/backend` and `/frontend` with `npm run build`.
3. Copy `.env.example` to `.env`.
4. Download the sipgate Softphone from [here](https://www.sipgate.de/softphone-download).
5. Login with your sipgate account.
6. Choose a phone number from your sipgate account and enter it as `NUMBER_TO_CALL` in the `.env`.
7. Select the device, that is connected to the choosen phone number, in the dropdown of the softphone.
8. Create an ngrok account on [ngrok.com](https://ngrok.com/)
9. Copy your [authtoken from ngrok](https://dashboard.ngrok.com/get-started/your-authtoken) and enter it's value as `NGROK_AUTH_TOKEN` in the `.env`.
10. Create a Personal-Access-Token on [app.sipgate.com](https://app.sipgate.com/w0/personal-access-token) with the two scopes:
    - `settings:sipgateio:read`
    - `settings:sipgateio:write`
11. Enter the token as `PAT_TOKEN` and the token ID as `PAT_TOKEN_ID` into the `.env`.

## Start

1. Start the project with `npm start`.
2. Start the sipgate Softphone and ensure that the correct phone is selected (see [Setup](#setup)).
3. Press `Enter` in the console once the softphone is running and configured.

## The Game

### Usage

To connect to the game, the player must call the number shown on the screen and then use the numberpad to control the game.
After reading the instructions, the player must first press a key to start the game.

### Rules

Mastermind is about guessing a code, consisting of four different digits, in up to ten tries.
After guessing a code, the game gives you two numbers as feedback:

- the number in the square brackets is the amount of digits that are at the correct position
- the number in the parentheses is the amount of digits that are at the wrong position, but do appear in the code

These two pieces of information will help you to improve your next guess.
You will get more points, the fewer guesses you need and the faster you complete the game.

The two red arrows indicate in which row and column you are currently located. Press a digit from 1 to 6 to enter it at the present location. By clicking \* the arrow moves to the right until it wraps around to the first column. You can confirm your input with the # button.

## Common Issues

### Can't start because `TypeError: Cannot read properties of undefined (reading 'body')`
This issue occurs, when another ngrok instance is running. To fix this, you need to make sure that no other instance of Mastermind is running, by killing all processes on the ports 3000, 3001 and 3002. Enter the command `sudo lsof -iTCP -sTCP:LISTEN` and look for programs that listen on the ports listed above in the `NAME` column. Kill a process by its PID using `sudo kill <PID>`.

### Allow a player to call a second time

Since every players phone number is listed in a database, you need to remove the corresponding entry from the database to allow a caller to play again.

1. Open the databse (for example with SQLitebrowser)
2. Select the `games` table
3. Find and delete the row that corresponds to the phone number 
4. Write the changes you've made
