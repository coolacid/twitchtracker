http = require('https');
tc = require("timezonecomplete");
io = require('socket.io-client');
irc = require('irc');

config = require("./config.json")

global.lastfollower = new tc.DateTime();
global.followers = [];
global.msgqueue = [];

var url = 'https://api.twitch.tv/kraken/channels/' + config['user'] + '/follows/?limit=10';

// Start the IRC Bot to listen for new subscribers
var bot = new irc.Client('irc.twitch.tv', config['botname'], {
    debug: true,
    channels: ["#" + config['user']],
    password: config['token']
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

function start_streamtip() {
    var socket = io.connect('https://streamtip.com', {
        query: 'client_id='+encodeURIComponent(config['st_client_id'])+'&access_token='+encodeURIComponent(config['st_access_token'])
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

function follower_poll(url) {
    http.get(url, function(res) {
	var body = '';

	res.on('data', function(chunk) {
	    body += chunk;
	});

	res.on('end', function() {
	    var fbResponse = JSON.parse(body)
	    handle_follows(fbResponse.follows);
	});
    }).on('error', function(e) {
        console.log("Got error: ", e);
    });
}

function handle_follows(follows) {
	follows.forEach(function(follow) {
	    followtime = new tc.DateTime(follow.created_at)
	    if (followtime.greaterThan(global.lastfollower) & global.followers.indexOf(follow.user.name) < 0) {
		console.log("New Follower: ", follow.user.name);
		global.msgqueue.unshift(follow.user.name + " followed!");
		global.followers.push(follow.user.name);
	    }
	});
	global.lastfollower = new tc.DateTime(follows[0].created_at);
	console.log(follows[0].created_at)
}

function updatemsg() {
    if (global.msgqueue.length > 0) {
	mesg = global.msgqueue.pop()
	smoothAdd('u10', mesg);
    }
}

setInterval(follower_poll, 30000, url);
setInterval(updatemsg, 5000);
start_streamtip();
