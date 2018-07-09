#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
#run in src directory
cd "$DIR"

#MIXXX_CONTROLLER_INSTALL_DIR="/usr/share/mixxx/controllers"
MIXXX_CONTROLLER_INSTALL_DIR="${HOME}/download/mixxx-release-2.1.1/res/controllers/"
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
echo "copying resulting XML file to ${DIR}/../controllers/${CONTROLLER_XML_FILENAME}"
echo "copying controller.js to ${DIR}/../controllers/$CONTROLLER_JS_FILENAME"
#echo "enter to continue, ctrl+c to abort"
#read a

mv "$tmpfile" "${DIR}/../controllers/${CONTROLLER_XML_FILENAME}" \
&& cp controller.js "${DIR}/../controllers/$CONTROLLER_JS_FILENAME" \
&& chmod 644 "${DIR}/../controllers/${CONTROLLER_XML_FILENAME}" \
&& chmod 644 "${DIR}/../controllers/${CONTROLLER_JS_FILENAME}"

echo "installing files to $MIXXX_CONTROLLER_INSTALL_DIR"

if [ ! -d "$MIXXX_CONTROLLER_INSTALL_DIR" ]
then
	echo -e "install directory not found: $MIXXX_CONTROLLER_INSTALL_DIR"
	echo -e "aborting."
	exit 1
fi

cp "${DIR}/../controllers/${CONTROLLER_XML_FILENAME}" "$MIXXX_CONTROLLER_INSTALL_DIR" \
&& cp "${DIR}/../controllers/${CONTROLLER_JS_FILENAME}" "$MIXXX_CONTROLLER_INSTALL_DIR"
ret=$?

echo "done"

exit $ret

#echo "install to ${MIXXX_CONTROLLER_INSTALL_DIR}?"
#read a
#sudo -k
#sudo cp "${DIR}/../controllers/${CONTROLLER_XML_FILENAME}" "${MIXXX_CONTROLLER_INSTALL_DIR}" \
#&& sudo cp "${DIR}/../controllers/${CONTROLLER_JS_FILENAME}" "${MIXXX_CONTROLLER_INSTALL_DIR}" \
#&& sudo chmod 644 "${MIXXX_CONTROLLER_INSTALL_DIR}/${CONTROLLER_XML_FILENAME}" \
#&& sudo chmod 644 "${MIXXX_CONTROLLER_INSTALL_DIR}/${CONTROLLER_JS_FILENAME}"

#EOF
