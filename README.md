TwitchTracker
=============

This is a node-webkit application to monitor and provide twitch notifications. 

![](https://github.com/coolacid/twitchtracker/blob/master/ScreenShots/ss1.png)

Currently, this has two options, a scrolling window and write the events to a text file.

To Run:
- Download a ZIP package
- Run the first time, it will create an empty configuration file
- Edit the configuration file with a text editor - following all instructions in the file
- Run a second time
- Profit!

Configuration/Data files are found in:
- Windows: %LOCALAPPDATA%/TwitchTracker/
- Linux: ~/.config/TwitchTracker/
- OSX: ~/Library/Application Support/TwitchTracker/

To start from source:
- Install node, npm, and node-webkit for your platform
- Download the software
- run "npm install" to get all the depencies
- Launch the software running node-webkit

Note: 

You can also build a bundle by installing and running node.js grunt.

Modifing the Looks
==================

So you don't like my talented design? Well, really, it's a direct rip from the tutorial http://www.fiveminuteargument.com/blog/scrolling-list.

Any case, if you haven't already guessed it's all HTML/CSS based.

Currently, if you're running using a package, you can only modify the CSS file. You do this by placeing a ui.css file in the same directory as your twitchtracker.yml configuration file.

Chroma Key
==========

If you want to play with chroma key, there is an example ui-chroma.css file in the css directory. Just rename the file to ui.css and place in the same directory as your twitchtracker.yml configuration file.

Binaries
========

Current releases as binaries are located at https://www.coolacid.net/TwitchTracker/

Tip Jar
=======

You can find my tip jar at: 
https://gist.github.com/coolacid/9537573

