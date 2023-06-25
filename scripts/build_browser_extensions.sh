#!/bin/bash -e

PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

yarn build -l silent

rm -rf artifacts/*.zip

# build chrome extension
rm -rf browser_extension/chrome/assets browser_extension/chrome/images browser_extension/chrome/index.html
cp -r ./src/assets/images/logo/manifest browser_extension/chrome/logo
cp -r dist/* browser_extension/chrome/
cd browser_extension/chrome && zip -rq ../../artifacts/elasticvue-"$PACKAGE_VERSION"-chrome.zip ./* && cd -

# build firefox extension
if [[ $(command -v web-ext) ]]; then
  rm -rf browser_extension/firefox/assets browser_extension/firefox/images browser_extension/firefox/index.html
  cp -r ./src/assets/images/logo/manifest browser_extension/firefox/logo
  cp -r dist/* browser_extension/firefox/
  cd browser_extension/firefox && web-ext build -s ./ -a ../../artifacts --filename="elasticvue-$PACKAGE_VERSION-firefox.zip"
else
  echo 'web-ext not found, cannot build firefox extension'
fi

echo ''
echo -e '\xE2\x9C\x94 Browser extensions built in ./artifacts:'
ls -l artifacts
