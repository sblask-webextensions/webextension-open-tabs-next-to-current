#!/bin/bash

DIRECTORY=$(dirname $0)

rm -f $DIRECTORY/addon.xpi
zip $DIRECTORY/addon.xpi --recurse-paths -0 $DIRECTORY/* --exclude $DIRECTORY/pack.sh --exclude *.swp

