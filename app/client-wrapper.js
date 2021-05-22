// NPM Dependencies
const assert = require('assert');
const irc = require('irc');
const { fromEvent } = require('rxjs');
const { takeUntil } = require('rxjs/operators');

// Local Dependencies
const logger = require('./logger');

/** @external {Client} https://www.npmjs.com/package/irc */

/**
 * @see https://node-irc.readthedocs.io/en/latest/API.html#client
 *
 * @type {Object}
 * @property {string} userName='rxbot'
 * @property {string} realName='ReactiveX&nbsp;IRC&nbsp;bot'
 * @property {string} localAddress=null
 * @property {boolean} debug=false
 * @property {boolean} showErrors=true
 * @property {boolean} autoRejoin=false
 * @property {boolean} autoConnect=false
 * @property {boolean} secure=true
 * @property {boolean} selfSigned=true
 * @property {boolean} certExpired=true
 * @property {boolean} floodProtection=false
 * @property {number} floodProtectionDelay=1000
 * @property {boolean} sasl=false
 * @property {number} retryCount=0
 * @property {number} retryDelay=2000
 * @property {boolean} stripColors=true
 * @property {string} channelPrefixes='&amp;#'
 * @property {number} messageSplit=512
 * @property {string} encoding='UTF-8'
 */
let defaults = {
	userName: 'rxbot',
	realName: 'ReactiveX IRC bot',
	localAddress: null,
	debug: false,
	showErrors: true,
	autoRejoin: false,
	autoConnect: false,
	secure: true,
	selfSigned: true,
	certExpired: true,
	floodProtection: false,
	floodProtectionDelay: 1000,
	sasl: false,
	retryCount: 0,
	retryDelay: 2000,
	stripColors: true,
	channelPrefixes: "&#",
	messageSplit: 512,
	encoding: 'UTF-8',
};

class ClientWrapper {
	constructor(options) {
		/** @type {object} */
		this.settings = { ...defaults, ...options };

		this.lib = new irc.Client(
			this.settings.server,
			this.settings.nick,
			this.settings
		);

		this.raw$ = fromEvent(this.lib, 'raw').pipe(
			takeUntil(fromEvent(this.lib, 'quit'))
		);

		this.lib.on('error', error => logger.error(error));

		this.raw$.subscribe(message => {
			logger.debug(JSON.stringify(message, null, 2));
		});
	}

	connect(callback) {
		this.lib.connect(callback);
	}

	disconnect(reason, callback) {
		this.lib.disconnect(reason, callback);
	}

	join(channels) {
		if (typeof channels === 'string') {
			channels = channels.split(' ');
		}
		assert(channels instanceof Array);

		channels.forEach(channel => this.lib.join(channel));
	}

	part(channels, message) {
		if (typeof channels === 'string') {
			channels = channels.split(' ');
		}
		assert(channels instanceof Array);

		channels.forEach(channel => this.lib.part(channel, message));
	}

	kick(channel, nicks, reason) {
		if (typeof nicks === 'string') {
			nicks = nicks.split(' ');
		}
		assert(nicks instanceof Array);

		nicks.forEach(nick => {
			let command = ['KICK', channel, nick];

			if (reason) {
				command.push(reason);
			}

			this.lib.send(...command);
		});
	}

	getNick() {
		return this.lib.nick;
	}

	setNick(nick) {
		this.lib.send('NICK', nick);
	}

	getTopic(channel) {
		let topic;
		let data = this.lib.chanData(channel);

		if (data && data.topic) {
			topic = data.topic;

			if (data.topicBy) {
				topic += ` set by ${data.topicBy}`;
			}
		}

		return topic;
	}

	setTopic(channel, message) {
		this.lib.send('TOPIC', channel, message);
	}

	sendMessage(type, target, lines, prefix) {
		assert.strictEqual(typeof target, 'string');
		assert.match(type, /PRIVMSG|NOTICE/i);

		if (typeof lines === 'string') {
			lines = lines.split(/[\r\n]+/);
		} else if (Buffer.isBuffer(lines)) {
			lines = lines.toString()
				.split(/[\r\n]+/)
				.filter(line => line.length);
		}
		assert(lines instanceof Array);

		if (prefix !== undefined) {
			lines = lines.map(line => `${prefix} ${line}`)
		}

		lines.forEach(line => this.lib.send(type, target, line));
	}

	setPrivileges(channel, action, privilege, nicks) {
		assert.strictEqual(typeof channel, 'string');
		assert.match(action, /\+|\-/);
		assert.match(privilege, /v|h|o/i);

		if (typeof nicks === 'string') {
			nicks = nicks.split(' ');
		}
		assert(nicks instanceof Array);

		let batch_size = 6;
		let batch_count = Math.ceil(nicks.length / batch_size);

		for (let i = 0; i < batch_count; i++) {
			let batch_offset = i * batch_size;
			let batch_nicks = nicks.slice(batch_offset, batch_offset + batch_size);
			let batch_mode = action + privilege.repeat(batch_nicks.length);
			let batch_args = ['MODE', channel, batch_mode].concat(batch_nicks);

			this.lib.send(...batch_args);
		}
	}

	tell(target, message, prefix) {
		this.sendMessage('PRIVMSG', target, message, prefix);
	}

	notify(target, message, prefix) {
		this.sendMessage('NOTICE', target, message, prefix);
	}

	giveOps(channel, nicks) {
		this.setPrivileges(channel, '+', 'o', nicks);
	}

	takeOps(channel, nicks) {
		this.setPrivileges(channel, '-', 'o', nicks);
	}

	giveHops(channel, nicks) {
		this.setPrivileges(channel, '+', 'h', nicks);
	}

	takeHops(channel, nicks) {
		this.setPrivileges(channel, '-', 'h', nicks);
	}

	giveVoices(channel, nicks) {
		this.setPrivileges(channel, '+', 'v', nicks);
	}

	takeVoices(channel, nicks) {
		this.setPrivileges(channel, '-', 'v', nicks);
	}
}

module.exports = ClientWrapper;
