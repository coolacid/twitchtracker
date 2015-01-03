gui = require('nw.gui');
fs = require('fs');
path = require('path');
yaml = require('js-yaml');
os = require('os');

inputs = {};

function load_plugin(plugin) {
    inputs[plugin] = require('./js/parts/' + plugin);
    console.log(inputs[plugin].config)
}

plugins = fs.readdirSync("./js/parts")
plugins.forEach(function(item) {
    load_plugin(item);
});
