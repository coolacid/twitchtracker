function handle_irc(from, message){
    if ( from.match(/^twitchnotify$/) ) {
        user = message.split(" ")[0]
        text = global.config.welcome.text;
        text = text.replace("$USER", user);
	global.inputs['irc'].say(text)
        console.log(text);
    }
}

module.exports = {
    start: function start() {
        console.log('Started welcome');
    },
    config: { "description": "Option to welcome new subscribers.",
              "options": {
                  "text": {"description": "The text for the bot to say. $USER is the username. (Default: Welcome $USER!)", "type": "string"}
              }
    },
    init: function init() {
        global.useirc = true;
        if (!global.config.welcome.text) {
            global.config.welcome.text = "Welcome $USER!";
        }
        return true;
    },
    irc_receiver: function (from, message) {
        handle_irc(from,message)
    }
};
