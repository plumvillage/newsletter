#!/bin/sh

npm install

DIR="src/pagedjs"
if [ ! -d "$DIR" ]; then
 mkdir "$DIR"
fi


POLYFILL=src/pagedjs/paged.polyfill.js
if [ ! -f "$POLYFILL" ]; then
    wget -O $POLYFILL https://unpkg.com/pagedjs/dist/paged.polyfill.js
fi

INTERFACE=src/pagedjs/interface.css
if [ ! -f "$INTERFACE" ]; then
    wget -O $INTERFACE https://gitlab.pagedmedia.org/tools/interface-polyfill/-/raw/master/interface.css?inline=false
fi
