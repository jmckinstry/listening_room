#!/bin/sh
#
# Execute this file to compile file parts into their larger files
#

# For loop gracious taken from: https://stackoverflow.com/questions/8183191/concatenating-files-and-insert-new-line-in-between-files

#_WITH_DEBUG=
_WITH_DEBUG=true

DATESTAMP=`date "+%Y%m%d%H%M%S"`

if [ "$_WITH_DEBUG" = true ] ; then
UGLIFYJS_OPTIONS=-b
else
UGLIFYJS_OPTIONS=-c -m --mangle-props --name-cache src/cache.json
fi

rm -f src/vars.sed

# client/base.js : The bare minimum javascript required to start UI and processing on the page
rm -f client/script/base_*.js
uglifyjs ${UGLIFYJS_OPTIONS} -- \
	src/client/*.js \
	src/client/UI/*.js \
	src/credits/*.js \
	> client/script/base_${DATESTAMP}.js

# client/template_${DATESTAMP}.ractive: The templates for Ractive to render UI
rm -f client/template_*.ractive

for f in src/client/UI/templates/*; do (cat "${f}"; echo) >> client/template_${DATESTAMP}.ractive; done

# Replacement : Replace placeholder names in source files
echo "s/{{BUILD_TIMESTAMP}}/${DATESTAMP}/g" >> src/vars.sed

# client/index.html
sed -f src/vars.sed src/client/index.html > client/index.html

# client/css/*
rm -r client/css
cp -R src/client/css client/css


# Now dump out test files if necessary
if [ "$_WITH_DEBUG" = true ] ; then
rm -f client/tests.html
rm -f client/tests.js

sed -f src/vars.sed tests/tests.html > client/tests.html

uglifyjs ${UGLIFYJS_OPTIONS} -- tests/tests.js > client/tests.js
uglifyjs ${UGLIFYJS_OPTIONS} -- tests/test-*.js >> client/tests.js
fi
