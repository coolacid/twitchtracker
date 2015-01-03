io = require('socket.io-client');

function start_streamtip() {
    var socket = io.connect('https://streamtip.com', {
        query: 'client_id='+encodeURIComponent(global.config.streamtip.client_id)+'&access_token='+encodeURIComponent(global.config.streamtip.access_token)
    });

    socket.on('authenticated', function() {
        console.log('Streamtip: authenticated');
    });

    socket.on('error', function(err) {
        if(err === '401::Access Denied::') {
            console.log('Streamtip: authentication failed');
        }
    });

    socket.on('newTip', function (data) {
        // We got a new tip!
        text = global.config.streamtip.text;
        text = text.replace("$USER", data.username);
        text = text.replace("$AMOUNT", data.amount);
        console.log(text);
        global.msgqueue.unshift(text);
    });
}

module.exports = {
    start: function start() {
        console.log("Starting Streamtip");
        start_streamtip();
    }, 
    config: { "description": "Connect to streamtip and watch for new tips",
              "options": {
                  "client_id": {"description": "The streamtip client ID.", "type": "string"},
                  "access_token": {"description": "The streamtip token", "type": "string"},
		  "text": {"description": "The text to display. $USER is the user, $AMOUNT is the amount.", "type": "string"}
              }
    },
    init: function init() {
        if (!global.config.streamtip.client_id) return false
        if (!global.config.streamtip.access_token) return false
        if (!global.config.streamtip.text) {
            global.config.streamtip.text = "$USER just tipped $AMOUNT";
        }
        return true;
    }
};
