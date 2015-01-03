irc = require('irc');
var bot;

function start_ircbot() {
    // Start the IRC Bot to listen for new subscribers
    bot = new irc.Client('irc.twitch.tv', global.config.irc.botname, {
        debug: global.config.irc.debug,
        channels: ["#" + global.config['user']],
        password: global.config.irc.token
    });

    bot.addListener('error', function(message) {
        console.error('ERROR: %s: %s', message.command, message.args.join(' '));
    });

    bot.addListener('message', function (from, to, message) {
        if ( to.match(/^[#&]/) ) {
            for (inputk in global.inputs) {
                input = global.inputs[inputk];
                if (typeof input.irc_receiver == "function") {
                    input.irc_receiver(from, message);
                }
            };
        }
    });
}

function say_ircbot(message) {
    bot.say("#" + global.config['user'], message);
}

module.exports = {
    start: function start() {
        start_ircbot();
    },
    config: { "description": "Query Twitch API for new followers",
              "options": {
                  "botname": {"description": "The username for the bot.", "type": "string"},
                  "token": {"description": "The token or password for the bot.", "type": "string"}
              }
    },
    say: function say(message) {
	say_ircbot(message);
    },
    init: function init() {
        if (!global.config.irc.botname) return false;
        if (!global.config.irc.token) return false;
        if (!global.config.irc.debug) global.config.irc.debug = false;
        return true;
    }
};
