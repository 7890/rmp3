#!/bin/bash

#run in src directory

if [ ! -r "mixxxml.class" ]
then
	echo -e "no mixxxml class found."
	echo -e "compile with 'javac mixxxml.java'"
	exit 1
fi

java mixxxml controller.js | xmlstarlet fo > out.xml

cat out.xml

echo "move out.xml to ../controllers/RMP-3.midi.xml ?"
echo "copy controller.js to ../controllers/Reloop-RMP-3-scripts.js ?"
echo "ctrl+c to abort"
read a

mv out.xml ../controllers/RMP-3.midi.xml
cp controller.js ../controllers/Reloop-RMP-3-scripts.js

