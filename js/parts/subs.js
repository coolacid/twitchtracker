irc = require('irc');

function start_ircbot() {
// Start the IRC Bot to listen for new subscribers
    var bot = new irc.Client('irc.twitch.tv', global.config.subs.botname, {
	debug: true,
	channels: ["#" + global.config['user']],
	password: global.config.subs.token
    });

    bot.addListener('error', function(message) {
	console.error('ERROR: %s: %s', message.command, message.args.join(' '));
    });

    bot.addListener('message', function (from, to, message) {
	if ( to.match(/^[#&]/) ) {
	    if ( from.match(/^twitchnotify$/) ) {
		global.msgqueue.unshift(message);
		console.log('Got: %s', message);
	    }
	}
    });
}

module.exports = {
    start: function() {
	start_ircbot();
    }
};

