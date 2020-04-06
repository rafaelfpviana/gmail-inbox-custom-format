const ib = require('./gmail-inbox');
const customFormat = require('./lib/CustomFormat');

async function exeCuteMe() {
	let inbox = new ib.Inbox(
		'credentials.json',
		'gmail-token.json',
		new customFormat.CustomFormat()
	);
	await inbox.authenticateAccount(); // logs user in

	const options = {
		category: 'updates',
		before: {
			date: new Date(2020, 4, 5),
			precision: 'day'
		},
		after: {
			date: new Date(2020, 4, 4),
			precision: 'day'
		}
	};
	const msgPerRequest = 2;

	var messages = await inbox.findMessages(options, msgPerRequest);

	while(inbox.getPageToken()){
		let loopMessages = await inbox.findMessages(options, msgPerRequest);
		if(loopMessages.length)
			messages = messages.concat(loopMessages);
	}

	let messagesJson = JSON.stringify(messages, null, 2);
	console.log(messagesJson);
}

exeCuteMe();
