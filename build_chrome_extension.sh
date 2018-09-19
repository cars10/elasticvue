#!/bin/bash -e

npx vue-cli-service build

# make chrome extension
rm -rf chrome_extension/index.html chrome_extension/assets
cp -r dist/* chrome_extension/
mkdir -p chrome_extension/assets/img/logo
cp -r public/images/logo/*_blue.png chrome_extension/assets/img/logo
