#!/bin/bash -e
set -e
PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

rm -rf artifacts/*

function buildExtension () {
  VARIANT=$1
  rm -rf dist/*
  VITE_APP_BUILD_MODE=browser_extension VITE_APP_VARIANT=$VARIANT npm run build
  rm -rf browser_extension/"$VARIANT"/assets browser_extension/"$VARIANT"/images browser_extension/"$VARIANT"/index.html
  cp -r ./src/assets/images/logo/manifest browser_extension/"$VARIANT"/logo
  cp -r dist/* browser_extension/"$VARIANT"/
}

# build chrome extension
buildExtension chrome
cd browser_extension/chrome && zip -rq ../../artifacts/elasticvue-"$PACKAGE_VERSION"-chrome.zip ./* && cd -

# build edge extension
buildExtension edge
cd browser_extension/edge && zip -rq ../../artifacts/elasticvue-"$PACKAGE_VERSION"-edge.zip ./* && cd -

# build firefox extension
if [[ $(command -v web-ext) ]]; then
  buildExtension firefox
  cd browser_extension/firefox && web-ext build -s ./ -a ../../artifacts --filename="elasticvue-$PACKAGE_VERSION-firefox.zip"
else
  echo 'web-ext not found, cannot build firefox extension'
fi

echo ''
echo -e '\xE2\x9C\x94 Browser extensions built in ./artifacts:'
ls -l ../../artifacts
