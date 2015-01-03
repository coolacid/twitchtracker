http = require('https');
tc = require("timezonecomplete");

global.lastfollower = new tc.DateTime();
global.followers = [];

function follower_poll() {
    var url = 'https://api.twitch.tv/kraken/channels/' + global.config['user'] + '/follows/?limit=' + global.config.followers.query;

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
            text = global.config.followers.text;
            text = text.replace("$USER", follow.user.name);
            console.log(text);
            global.msgqueue.unshift(text);
            global.followers.push(follow.user.name);
        }
    });
    global.lastfollower = new tc.DateTime(follows[0].created_at);
    console.log(follows[0].created_at)
}

module.exports = {
    start: function start() {
        console.log("Started Followers with query: " + global.config.followers.query);
        setInterval(follower_poll, 30000);
    },
    config: { "description": "Query Twitch API for new followers", 
	      "options": {
		  "query": {"description": "The number of last followers to query from twitch. (Default 10)", "type": "number"},
		  "text": {"description": "Text returned on new follower. $USER is the username. (Default $USER just followed!", "type": "string"}
	      }
    },
    init: function init() {
        // Should have query set to int, default 10
        if (isNaN(global.config.followers.query)) { 
            global.config.followers.query = 10
        }
        if (!global.config.followers.text) {
            global.config.followers.text = "$USER just followed!";
        }
        return true
    }

};
