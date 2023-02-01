#!/bin/bash

set -e

[ -z "$VERSION" ] && echo "You have to set a VERSION to run this script." && exit 1;

# bump version to $VERSION
sed -e "s/\"version\":\s\".*\"/\"version\": \"$VERSION\"/" -i package.json
sed -e "s/\"version\":\s\".*\"/\"version\": \"$VERSION\"/" -i src-tauri/tauri.conf.json
sed -e "s/\"version\":\s\".*\"/\"version\": \"$VERSION\"/" -i browser_extension/chrome/manifest.json
sed -e "s/\"version\":\s\".*\"/\"version\": \"$VERSION\"/" -i browser_extension/firefox/manifest.json

# commit new version
git add package.json
git add browser_extension/chrome/manifest.json
git add browser_extension/firefox/manifest.json
git commit -am "bumps version to $VERSION"

# push new version
git push

# merge with master
git checkout master
git merge develop -m "automatic merge to finish v$VERSION"

# push master
git push

# tag new version
git tag -a "v$VERSION"

# push tags
git push --tags

# build chrome extension
rm -f elasticvue.zip
yarn build_browser_extensions

git checkout develop
