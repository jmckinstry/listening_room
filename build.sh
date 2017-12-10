#!/bin/sh
#
# Execute this file to compile file parts into their larger files
#

# For loop gracious taken from: https://stackoverflow.com/questions/8183191/concatenating-files-and-insert-new-line-in-between-files

DATESTAMP=`date "+%Y%m%d%H%M%S"`

UGLIFYJS_OPTIONS=-b
#UGLIFYJS_OPTIONS=-c -m --mangle-props --name-cache src/cache.json

rm -f src/vars.sed

# client/base.js : The bare minimum javascript required to start UI and processing on the page
rm -f client/script/base_*.js
uglifyjs ${UGLIFYJS_OPTIONS} -- \
	src/client/*.js \
	src/client/UI/*.js \
	src/credits/*.js \
	src/client/last/*.js \
	> client/script/base_${DATESTAMP}.js

# client/template_${DATESTAMP}.ractive: The templates for Ractive to render UI
rm -f client/template_*.ractive

for f in src/client/UI/templates/*; do (cat "${f}"; echo) >> client/template_${DATESTAMP}.ractive; done

# Replacement : Replace placeholder names in source files
echo "s/{{BUILD_TIMESTAMP}}/${DATESTAMP}/g" >> src/vars.sed

sed -f src/vars.sed src/client/index.html > client/index.html

