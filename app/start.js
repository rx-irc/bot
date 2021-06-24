// NPM Dependencies
const Client = require('@rx-irc/client');

// Local Dependencies
const logger = require('./logger');
const config = require('../config');

let client = new Client(config.client);

client.connect(() => {
	logger.info(`Connected to ${config.client.host}.`);

	config.modules
		.filter(module => module.enabled !== false)
		.forEach(module => {
			let Module = require(`@rx-irc/bot-${module.name}`);
			new Module(client, module.options);

			logger.info(`Loaded module ${module.name}.`);
		});
});
