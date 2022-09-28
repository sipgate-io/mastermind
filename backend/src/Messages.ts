import { bold, green, red, redBright, yellow } from 'colorette';

function anonymizePhone(number: string) {
	let publicDigits = number.substring(number.length - 4);
	return bold(`+xx xxxx xxxx${publicDigits}`);
}

export const MASTERMIND_LOGO = `
 _______  _______  _______ _________ _______  _______  _______ _________ _        ______  
(       )(  ___  )(  ____ \\\__   __/(  ____ \\(  ____ )(       )\\__   __/( (    /|(  __  \\  
| () () || (   ) || (    \\/   ) (   | (    \\/| (    )|| () () |   ) (   |  \\  ( || (  \\  )
| || || || (___) || (_____    | |   | (__    | (____)|| || || |   | |   |   \\ | || |   ) |
| |(_)| ||  ___  |(_____  )   | |   |  __)   |     __)| |(_)| |   | |   | (\\ \\) || |   | |
| |   | || (   ) |      ) |   | |   | (      | (\\ (   | |   | |   | |   | | \\   || |   ) |
| )   ( || )   ( |/\\____) |   | |   | (____/\\| ) \\ \\__| )   ( |___) (___| )  \\  || (__/  )
|/     \\||/     \\|\\_______)   )_(   (_______/|/   \\__/|/     \\|\\_______/|/    )_)(______/ 
                                                                                          
 ______                    _______ _________ _______  _______  _______ _________ _______  
(  ___ \\ |\\     /|        (  ____ \\\\__   __/(  ____ )(  ____ \\(  ___  )\\__   __/(  ____ \\ 
| (   ) )( \\   / )        | (    \\/   ) (   | (    )|| (    \\/| (   ) |   ) (   | (    \\/ 
| (__/ /  \\ (_) /         | (_____    | |   | (____)|| |      | (___) |   | |   | (__     
|  __ (    \\   /          (_____  )   | |   |  _____)| | ____ |  ___  |   | |   |  __)    
| (  \\ \\    ) (                 ) |   | |   | (      | | \\_  )| (   ) |   | |   | (       
| )___) )   | |           /\\____) |___) (___| )      | (___) || )   ( |   | |   | (____/\\ 
|/ \\___/    \\_/           \\_______)\\_______/|/       (_______)|/     \\|   )_(   (_______/ 
                                                                                          
`;

export const CALL_TEXT = (tel: string) =>
	bold(`Rufe ${tel} an, um das Spiel zu beginnen!`);

export const WELCOME_TEXT = (number: string) =>
	`Willkommen zu Mastermind von sipgate! Dies ist das Spiel von ${anonymizePhone(
		number
	)}.`;

const highlight = (text: string) => yellow(bold(text));

export const EXPLANATION_TEXT = `
In Mastermind geht es darum, einen Zahlencode aus vier verschiedenen Ziffern in bis zu ${highlight(
	'10'
)} Versuchen zu erraten.
Nachdem du einen Code geraten hast, gibt dir das Spiel zwei Zahlen als Feedback:
 ${highlight('[x]')} -> wie viele Ziffern an der richtigen Stelle sind
 ${highlight(
		'(y)'
 )} -> wie viele Ziffern zwar im zu erratenen Code vorkommen, aber an der falschen Stelle sind

Diese neuen Informationen helfen dir, im nächsten Versuch besser zu raten.
Je schneller und in je weniger Versuchen du den Code errätst, desto mehr Punkte bekommst du.

Die zwei roten Pfeile zeigen dir, in welcher Spalte und Zeile du aktuell bist.
Drücke eine Ziffer zwischen ${highlight(
	'1 bis 6'
)}, um die Ziffer an der aktuellen Stelle einzugeben.
Mit ${highlight(
	'*'
)} bewegst du den Pfeil nach rechts. Ist er am Rand angekommen, springt er wieder in die erste Spalte.
Du kannst eine Eingabe mit ${highlight('#')} bestätigen.
`;

export const SHORT_EXPLANATION_TEXT = `
Eingaben:
- ${highlight('1 - 6')}\tEine Ziffer an der aktuellen Stelle eintragen
- ${highlight('*')}\tCursor nach rechts schieben
- ${highlight('#')}\tEingabe bestätigen

Infos:
- ${highlight('[x]')}\t wie viele Ziffern an der richtigen Stelle sind
- ${highlight(
	'(y)'
)}\t wie viele Ziffern zwar im zu erratenen Code vorkommen, aber an der falschen Stelle sind
`;

export const ANNOUNCEMENT_COMPLETE_TEXT = `Hast du dir die Regeln durchgelesen?\nDann drücke eine Taste um das Spiel zu starten.`;

export const GAME_STATUS = (tries: number, duration: number) =>
	`Du hast für ${tries} ${
		tries > 1 ? 'Züge' : 'Zug'
	} ${duration} Sekunden gebraucht.`;

export const GAME_LOST = bold(redBright(`Leider hast du verloren.`));

export const GAME_WON = bold(
	green(`Herzlichen Glückwunsch, du hast Mastermind gelöst!`)
);

export const THANK_YOU = bold(green(`💐 Vielen Dank fürs Spielen! 💐`));

export const ERR_NO_DUPLICATES = 'Keine doppelten Ziffern erlaubt.';

export const ERR_INVALID_DIGIT = 'Nur Ziffern von 1 - 6 erlaubt.';

export const ERR_FILL_FULL = 'Bitte alle Felder dieser Zeile ausfüllen.';

export const CALLING_NUMBER = (number: string) =>
	`\nSpielfeld von: ${anonymizePhone(number)}`;
