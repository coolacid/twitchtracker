#!/bin/bash

## Linux build script
# Does each step and punches out some .zip files.

SPWD=$(pwd)

npm install
grunt

# Compress the Win64 package
cd $SPWD/build/TwitchTracker/win64/
zip -r $SPWD/TwitchTracker-Win64.zip *

# Compress the Win32 package
cd $SPWD/build/TwitchTracker/win32/
zip -r $SPWD/TwitchTracker-Win32.zip *

# Compress the Linux64 package
cd $SPWD/build/TwitchTracker/linux64/
zip -r $SPWD/TwitchTracker-Linux64.zip *

# Compress the Linux32 package
cd $SPWD/build/TwitchTracker/linux32/
zip -r $SPWD/TwitchTracker-Linux32.zip *

cd $SPWD

