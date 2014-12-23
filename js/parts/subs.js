function handle_irc(from, message){
    if ( from.match(/^twitchnotify$/) ) {
	global.msgqueue.unshift(message);
	console.log('Got: %s', message);
    }
}

module.exports = {
    start: function start() {
	console.log('Started Subs');
    },
    init: function init() {
	global.useirc = true;
	return true;
    },
    irc_receiver: function (from, message) {
	handle_irc(from,message)
    }

};

