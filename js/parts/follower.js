http = require('https');
tc = require("timezonecomplete");

global.lastfollower = new tc.DateTime();
global.followers = [];

function follower_poll() {
    var url = 'https://api.twitch.tv/kraken/channels/' + global.config['user'] + '/follows/?limit=' + global.config.followers.query;

console.log(url)

    http.get(url, function(res) {
	var body = '';

	res.on('data', function(chunk) {
	    body += chunk;
	});

	res.on('end', function() {
	    var fbResponse = JSON.parse(body)
	    follower_handle(fbResponse.follows);
	});
    }).on('error', function(e) {
        console.log("Got error: ", e);
    });
}

function follower_handle(follows) {
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

module.exports = {
    start: function() {
	setInterval(follower_poll, 30000);
    }
};

