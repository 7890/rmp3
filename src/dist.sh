#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
#run in src directory
cd "$DIR"

MIXXX_CONTROLLER_INSTALL_DIR="/usr/share/mixxx/midi"
CONTROLLER_XML_FILENAME="Reloop RMP-3.midi.xml"
CONTROLLER_JS_FILENAME="Reloop-RMP-3-scripts.js"

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

for tool in java javac xmlstarlet mktemp; \
	do checkAvail "$tool"; done

if [ ! -d "$MIXXX_CONTROLLER_INSTALL_DIR" ]
then
	echo -e "install directory not found: $MIXXX_CONTROLLER_INSTALL_DIR"
	echo -e "aborting."
	exit -1
fi

if [ ! -r "mixxxml.class" ]
then
	echo -e "no mixxxml class found."
	echo -e "compiling with 'javac mixxxml.java' ..."
	javac mixxxml.java
fi

echo "generating xml and js file for rmp3 controller ..."
tmpfile="`mktemp`"
java mixxxml controller.js | xmlstarlet fo > "$tmpfile"
ret=$?

if [ $ret -ne 0 ]
then
	echo "failed."
	rm -f "$tmpfile"
	exit 1
fi

cat "$tmpfile"

echo ""
echo "success!"
echo ""
echo "copy resulting XML file to ${DIR}/../${CONTROLLER_XML_FILENAME} ?"
echo "copy controller.js to ${DIR}/../$CONTROLLER_JS_FILENAME ?"
echo "enter to continue, ctrl+c to abort"
read a

mv "$tmpfile" "${DIR}/../${CONTROLLER_XML_FILENAME}" \
&& cp controller.js "${DIR}/../$CONTROLLER_JS_FILENAME" \
&& chmod 644 "${DIR}/../${CONTROLLER_XML_FILENAME}" \
&& chmod 644 "${DIR}/../${CONTROLLER_JS_FILENAME}"

echo "install to ${MIXXX_CONTROLLER_INSTALL_DIR}?"
read a
sudo -k
sudo cp "${DIR}/../${CONTROLLER_XML_FILENAME}" "${MIXXX_CONTROLLER_INSTALL_DIR}" \
&& sudo cp "${DIR}/../${CONTROLLER_JS_FILENAME}" "${MIXXX_CONTROLLER_INSTALL_DIR}" \
&& sudo chmod 644 "${MIXXX_CONTROLLER_INSTALL_DIR}/${CONTROLLER_XML_FILENAME}" \
&& sudo chmod 644 "${MIXXX_CONTROLLER_INSTALL_DIR}/${CONTROLLER_JS_FILENAME}"

echo "done"

#EOF
