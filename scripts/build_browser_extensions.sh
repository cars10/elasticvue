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

# build chrome extension
rm -rf browser_extension/chrome/assets browser_extension/chrome/images browser_extension/chrome/index.html
git clean -xf browser_extension/chrome --quiet
cp -r dist/* browser_extension/chrome/
zip -r artifacts/elasticvue-$PACKAGE_VERSION-chrome.zip browser_extension/chrome/*

# build firefox extension
if [[ $(command -v web-ext) ]]; then
  rm -rf browser_extension/firefox/assets browser_extension/firefox/images browser_extension/firefox/index.html
  git clean -xf browser_extension/firefox --quiet
  cp -r dist/* browser_extension/firefox/
  web-ext build -s browser_extension/firefox -a artifacts --filename="elasticvue-$PACKAGE_VERSION-firefox.zip"
else
  echo 'web-ext not found, cannot build firefox extension'
fi
