io = require('socket.io-client');

function start_streamtip() {
    var socket = io.connect('https://streamtip.com', {
        query: 'client_id='+encodeURIComponent(global.config['st_client_id'])+'&access_token='+encodeURIComponent(global.config['st_access_token'])
    });

    socket.on('authenticated', function() {
        console.log('authenticated');
    });

    socket.on('error', function(err) {
        if(err === '401::Access Denied::') {
            console.log('authentication failed');
        }
    });

    socket.on('newTip', function (data) {
        // We got a new tip!
        console.log(data);
        global.msgqueue.unshift(data.username + " just tipped " + data.amount + "!");
    });
}

module.exports = {
    start: function() {
	start_streamtip();
    }
};
