gui = require('nw.gui');
fs = require('fs');
path = require('path');
yaml = require('js-yaml');

global.mainwin = gui.Window.get();

global.msgqueue = [];
global.filequeue = [];
global.inputs = {};
inputs = {};

run = false;

var confPath = path.join(gui.App.dataPath, "twitchtracker.yml");
var logPath = path.join(gui.App.dataPath, "logs");

try {
  global.config = yaml.load(fs.readFileSync(confPath, 'utf-8'));
  run = true;
} catch (err) {
  fs.createReadStream(path.join(process.cwd(), "twitchtracker.yml")).pipe(fs.createWriteStream(confPath));
  show_error("Copied a default config to'" +confPath+"'. Please edit this file!");
}

if (global.config.configured == false) {
    show_error("Edit the configuration file found at "+confPath);
} else {
    run = true
}

if (!fs.existsSync(logPath)){
    fs.mkdirSync(logPath);
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

if (run) {
    global.mainwin.on('loaded', function() {
	load_css();
	items = global.config.items
	while (items > 0) {
	    initAdd('u10');
	    items--;
	}
    });

    if (global.config.followers.active & run) {
	global.inputs['follower'] = require('./js/parts/follower.js');
	global.inputs['follower'].start()
    }

    if (global.config.streamtip.active & run) {
	global.inputs['streamtip'] = require('./js/parts/streamtip.js');
	global.inputs['streamtip'].start()
    }

    if (global.config.subs.active & run) {
	global.inputs.irc = require('./js/parts/irc.js');
	global.inputs.irc.start()
	global.inputs['subs'] = require('./js/parts/subs.js');
    }

    console.log(Object.keys(global.inputs).length);

    setInterval(updatemsg, 2500);
}

