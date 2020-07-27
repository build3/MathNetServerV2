#!/usr/bin/env bash
if [ ! -d "tmp" ]; then
 mkdir tmp
fi

if [ ! -d "tmp/deployment" ]; then
 mkdir tmp/deployment
fi

cp deployment/${1}/* tmp/deployment/
#cp -r public tmp/deployment/public