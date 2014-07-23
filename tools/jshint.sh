#!/bin/sh

cd ${0%/*} &&
cd ..
jshint --verbose url-to-qrcode/*.js
echo "rc=$?"
