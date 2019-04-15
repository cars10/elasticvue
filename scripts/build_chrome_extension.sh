#!/bin/bash -e

VUE_APP_ROUTER_MODE=hash vue-cli-service build

# make chrome extension
rm -rf chrome_extension/index.html chrome_extension/assets chrome_extension/icons-*
cp -r dist/* chrome_extension/
mkdir -p chrome_extension/assets/img/logo
cp -r public/images/logo/*_blue.png chrome_extension/assets/img/logo

rm -rf elasticvue.zip
zip -r elasticvue.zip chrome_extension/*
