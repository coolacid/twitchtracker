function handle_irc(from, message){
    if ( from.match(/^twitchnotify$/) ) {
        user = message.split(" ")[0]
        text = global.config.subs.text;
        text = text.replace("$USER", user);
        console.log(text);
        global.msgqueue.unshift(text);
    }
}

module.exports = {
    start: function start() {
        console.log('Started Subs');
    },
    config: { "description": "Display a message when a new sub is detected.",
              "options": {
                  "text": {"description": "The message to display. $USER is the username. (Default: $USER just subscribed)", "type": "string"}
              }
    },
    init: function init() {
        global.useirc = true;
        if (!global.config.subs.text) {
            global.config.subs.text = "$USER just subscribed!";
        }
        return true;
    },
    irc_receiver: function (from, message) {
        handle_irc(from,message)
    }
};
