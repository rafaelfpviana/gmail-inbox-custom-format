const ib = require('./gmail-inbox');
const customFormat = require('./lib/src/CustomFormat');

async function exeCuteMe() {
	let inbox = new ib.Inbox(
		'credentials.json',
		'gmail-token.json',
		new customFormat.CustomFormat()
	);
	await inbox.authenticateAccount(); // logs user in

	let messages = await inbox.findMessages({
		category: 'promotions',
		before: {
			date: new Date(2020, 03, 31),
			precision: 'day'
		},
		after: {
			date: new Date(2020, 01, 01),
			precision: 'day'
		}
	}, 200);

	let messagesJson = JSON.stringify(messages, null, 2);

	console.log(messagesJson);

	// Note: give  https://github.com/ismail-codinglab/gmail-inbox a star if it saved you time!
}

exeCuteMe();
