# RxBot

## Installation
1. Clone the [main RxBot repository](https://github.com/fkm/rx-irc-bot).
2. Adjust the **package.json** and **config.json** files according to your needs.
3. Install the dependencies with `npm install`.
4. Run the bot with `npm start`.

## Logging
The scope for the `DEBUG` environment variable is `rx-irc:bot`.

The bot and each of its modules come with five sub-scopes:
* `*:debug`
* `*:log`
* `*:info`
* `*:warn`
* `*:error`

It is recommended that you set the following environment variable:  
`DEBUG=rx-irc:bot:*,-rx-irc:bot:*:debug`

For more information refer to the [debug](https://www.npmjs.com/package/debug) read-me.
