#!/bin/sh

PGM_NAME=otter
DEST=/mathworks/inside/labs/dev/$PGM_NAME
# Hardcoding src is weird here, but it's probably safer than not doing it.
SRC=/sandbox/sgreenwo/otter

# Gather and name the bin scripts
rm -rf $DEST/bin
mkdir -p $DEST/bin
cp -pf $SRC/bin/$PGM_NAME $DEST/bin
cp -pf $SRC/bin/$PGM_NAME.bat $DEST/bin

rm -rf $DEST/dist
mkdir -p $DEST/dist
cp -pf $SRC/dist/index.js $DEST/dist

rm -rf $DEST/config
mkdir -p $DEST/config
cp -pf $SRC/config/jira.config.json $DEST/config

