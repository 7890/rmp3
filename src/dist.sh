#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
#run in src directory
cd "$DIR"

checkAvail()
{
	which "$1" >/dev/null 2>&1
	ret=$?
	if [ $ret -ne 0 ]
	then
		echo "tool \"$1\" not found. please install"
		exit 1
	fi
}


for tool in java javac xmlstarlet; \
	do checkAvail "$tool"; done

if [ ! -r "mixxxml.class" ]
then
	echo -e "no mixxxml class found."
	echo -e "compiling with 'javac mixxxml.java' ..."
	javac mixxxml.java
fi

echo "generating xml and js file for rmp3 controller ..."
java mixxxml controller.js | xmlstarlet fo > out.xml
ret=$?

if [ $ret -ne 0 ]
then
	echo "failed."
	exit 1
fi

cat out.xml

echo ""
echo "success!"
echo ""
echo "move out.xml to ../controllers/RMP-3.midi.xml ?"
echo "copy controller.js to ../controllers/Reloop-RMP-3-scripts.js ?"
echo "enter to continue, ctrl+c to abort"
read a

mv out.xml ../controllers/RMP-3.midi.xml \
&& cp controller.js ../controllers/Reloop-RMP-3-scripts.js

#EOF
