// Local Dependencies
const config = require('../config');
const ClientWrapper = require('./client-wrapper');

let client = new ClientWrapper(config.client);

client.connect(() => {
	config.modules
		.filter(module => module.enabled !== false)
		.forEach(module => {
			let Module = require(`@rx-irc/bot-${module.name}`);
			new Module(client, module.options);
		});
});
