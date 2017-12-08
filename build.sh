#!/bin/sh
#
# Execute this file to compile file parts into their larger files
#

# For loop gracious taken from: https://stackoverflow.com/questions/8183191/concatenating-files-and-insert-new-line-in-between-files

DATESTAMP=`date "+%Y%m%d%H%M%S"`
rm -f src/vars.sed

# client/base.js : The bare minimum javascript required to start UI and processing on the page
# - Reads from:
# -   src/client/
# -   src/client/templates/
# -   src/credits/
rm -f client/script/base_*.js
uglifyjs -c -m --mangle-props --name-cache src/cache.json -- src/client/*.js src/client/templates/*.js src/credits/*.js > client/script/base_${DATESTAMP}.js

echo "s/{{base.js}}/base_${DATESTAMP}.js/g" >> src/vars.sed

# Replacement : Replace placeholder names in source files
sed -f src/vars.sed src/client/index.html > client/index.html

