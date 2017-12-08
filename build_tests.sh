#!/bin/sh
#
# Execute this file to compile file parts into tests.html and tests.js for testing
#

rm -f client/tests.html
rm -f client/tests.js

UGLIFYJS_OPTIONS=-b
#UGLIFYJS_OPTIONS=-c

cp tests/tests.html client/tests.html

uglifyjs ${UGLIFYJS_OPTIONS} -- tests/tests.js >> client/tests.js
uglifyjs ${UGLIFYJS_OPTIONS} -- src/client/*.js src/client/templates/*.js src/credits/*.js >> client/tests.js
uglifyjs ${UGLIFYJS_OPTIONS} -- tests/test-*.js >> client/tests.js

