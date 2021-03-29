#!/bin/bash -e

PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

rm -rf artifacts
mkdir -p artifacts

VUE_APP_ROUTER_MODE=hash VUE_APP_DISABLE_CORS_HINT=true vue-cli-service build

rm -rf browser_extension/assets browser_extension/images
git clean -xf browser_extension --quiet
cp -r dist/* browser_extension/

# zip chrome extension
zip -r artifacts/elasticvue-$PACKAGE_VERSION-chrome.zip browser_extension/*

# build firefox extension
(command -v web-ext > /dev/null && web-ext build -s browser_extension -a artifacts) || (echo 'web-ext not found, cannot build firefox extension' && exit 1)
