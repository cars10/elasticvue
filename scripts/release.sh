#!/bin/bash

set -e

[ -z "$VERSION" ] && echo "You have to set a VERSION to run this script." && exit 1;

# bump version to $VERSION
sed -e "s/\"version\":\s\".*\"/\"version\": \"$VERSION\"/" -i package.json
sed -e "s/\"version\":\s\".*\"/\"version\": \"$VERSION\"/" -i browser_extension/chrome/manifest.json
sed -e "s/\"version\":\s\".*\"/\"version\": \"$VERSION\"/" -i browser_extension/edge/manifest.json
sed -e "s/\"version\":\s\".*\"/\"version\": \"$VERSION\"/" -i browser_extension/firefox/manifest.json
npm install

# add release to flatpak metainfo
RELEASE="    <release version=\"$VERSION\" date=\"$(date +%F)\">\n      <url type=\"details\">https://github.com/cars10/elasticvue/releases/tag/v$VERSION</url>\n    </release>"
sed -e "s|<releases>|<releases>\n$RELEASE|" -i flatpak/com.elasticvue.Elasticvue.metainfo.xml

# commit new version
git add package.json
git add package-lock.json
git add src-tauri/tauri.conf.json
git add flatpak/com.elasticvue.Elasticvue.metainfo.xml
git add -f browser_extension/chrome/manifest.json
git add -f browser_extension/edge/manifest.json
git add -f browser_extension/firefox/manifest.json
git commit -am "bumps version to $VERSION"

git push

git checkout master
git merge develop -m "automatic merge to finish v$VERSION"

git push

git tag -a "v$VERSION"
git push --tags

git checkout develop
