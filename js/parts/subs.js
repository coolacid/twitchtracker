function handle_irc(from, message){
    if ( from.match(/^twitchnotify$/) ) {
	global.msgqueue.unshift(message);
	console.log('Got: %s', message);
    }
    if ( from.match(/^coolacid$/) ) {
	global.msgqueue.unshift(message);
	console.log('Got: %s', message);
    }

}

module.exports = {
    start: function() {
	console.log('Started Subs');
    },
    irc_receiver: function (from, message) {
	handle_irc(from,message)
    }

};

