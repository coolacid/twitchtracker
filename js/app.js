http = require('https');
tc = require("timezonecomplete");
io = require('socket.io-client');
irc = require('irc');
gui = require('nw.gui');
fs = require('fs');
path = require('path');
yaml = require('js-yaml');

global.mainwin = gui.Window.get();

var confPath = path.join(gui.App.dataPath, "twitchtracker.yml");
var logPath = path.join(gui.App.dataPath, "logs");

try {
  global.config = yaml.load(fs.readFileSync(confPath, 'utf-8'));
} catch (err) {
  fs.createReadStream(path.join(process.cwd(), "twitchtracker.yml")).pipe(fs.createWriteStream(confPath));
  throw new Error("We have just coppied a default config to '" +confPath+"'. Please edit this file!");
//  gui.App.quit(); 
}

if (global.config.configured == false) {
    throw new Error("You need to edit the configuration file found at "+confPath);
}

if (!fs.existsSync(logPath)){
    fs.mkdirSync(logPath);
}

global.lastfollower = new tc.DateTime();
global.followers = [];
global.msgqueue = [];
global.filequeue = [];

global.mainwin.on('loaded', function() {
    items = global.config.items
    while (items > 0) {
	initAdd('u10');
	items--;
    }
});

function start_ircbot() {
// Start the IRC Bot to listen for new subscribers
    var bot = new irc.Client('irc.twitch.tv', global.config['botname'], {
	debug: true,
	channels: ["#" + global.config['user']],
	password: global.config['token']
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

function follower_poll() {
    var url = 'https://api.twitch.tv/kraken/channels/' + global.config['user'] + '/follows/?limit=10';

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
	write_file(mesg);
    }
}

function write_file(mesg) {
    file = path.join(logPath, global.config.file);
    console.log("Writing Stream file: " + file);
    global.filequeue.unshift(mesg);
    while (global.filequeue.length > global.config.items) {
	global.filequeue.pop()
    }
    var stream = fs.createWriteStream(file);
    stream.once('open', function(fd) {
	global.filequeue.forEach(function(mesg) {
	    stream.write(mesg + "\n");
	});
	stream.end();
    });
    stream.on('error', function (err) {
	console.log(err);
    });
//    stream.close();
}

if (global.config.followers) {
    setInterval(follower_poll, 30000);
}

if (global.config.tips) {
    start_streamtip();
}

if (global.config.subs) {
    start_ircbot();
}

setInterval(updatemsg, 5000);
