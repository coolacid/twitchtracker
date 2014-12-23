gui = require('nw.gui');
fs = require('fs');
path = require('path');
yaml = require('js-yaml');
os = require('os');

global.mainwin = gui.Window.get();

global.msgqueue = [];
global.filequeue = [];
global.inputs = {};

run = false;

var confPath = path.join(gui.App.dataPath, "twitchtracker.yml");
var logPath = path.join(gui.App.dataPath, "logs");

if (!fs.existsSync(confPath)) {
  fs.createReadStream(path.join(process.cwd(), "twitchtracker.yml")).pipe(fs.createWriteStream(confPath));
  show_error("Copied a default config to'" +confPath+"'. Please edit this file!");
}

try {
  global.config = yaml.load(fs.readFileSync(confPath, 'utf-8'));
  run = true;
} catch (err) {
  show_error("There was an error in your configuration file! " + err);
}

if (global.config.configured == false) {
    show_error("Edit the configuration file found at "+confPath);
} else {
    run = true
}

if (!fs.existsSync(logPath)){
    fs.mkdirSync(logPath);
}

// Force the username lowercase
global.config['user'] = global.config['user'].toLowerCase();

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
	    stream.write(mesg + os.EOL);
	});
	stream.end();
    });
    stream.on('error', function (err) {
	console.log(err);
    });
//    stream.close();
}

function load_css() {
    if (fs.existsSync(path.join(gui.App.dataPath, "ui.css"))) {
	filename = path.join(gui.App.dataPath, "ui.css");
    } else {
	filename = path.join(process.cwd(), "css", "ui.css");
    }
    var fileref=document.createElement("link")
    fileref.setAttribute("rel", "stylesheet")
    fileref.setAttribute("type", "text/css")
    fileref.setAttribute("href", filename)
    global.window.document.getElementsByTagName("head")[0].appendChild(fileref)
}

function show_error(mesg) {
	// Bug in linux does not show alert! https://github.com/rogerwang/node-webkit/issues/2683
	window.alert(mesg);
	throw new Error(mesg);
}

global.irc_received = function (from, message) {
    console.log(from, message);
}

function load_plugin(plugin) {
    global.inputs[plugin] = require('./js/parts/' + plugin + '.js');
    if (global.inputs[plugin].init()) {
        global.inputs[plugin].start()
    } else {
        console.log("There was an error initiallizing " + plugin);
    }
}

if (run) {
    global.mainwin.on('loaded', function() {
	load_css();
	items = global.config.items
	while (items > 0) {
	    initAdd('u10');
	    items--;
	}
    });

    if (global.config.followers.active) {
	load_plugin('follower');
    }

    if (global.config.streamtip.active) {
	load_plugin('streamtip');
    }

    if (global.config.subs.active) {
	load_plugin('subs');
    }

    if (global.useirc) {
	load_plugin('irc');
//	global.inputs.irc = require('./js/parts/irc.js');
//	global.inputs.irc.start()
    }

    setInterval(updatemsg, 2500);
}

