// Local Dependencies
const ClientWrapper = require('./client-wrapper');
const logger = require('./logger');
const config = require('../config');

let client = new ClientWrapper(config.client);

client.connect(() => {
	logger.info(`Connected to ${config.client.server}.`);

	config.modules
		.filter(module => module.enabled !== false)
		.forEach(module => {
			let Module = require(`@rx-irc/bot-${module.name}`);
			new Module(client, module.options);

			logger.info(`Loaded module ${module.name}.`);
		});
});
