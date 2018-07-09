#!/bin/bash

set -e

[ -z "$VERSION" ] && echo "You have to set a VERSION to run this script." && exit 1;

sh ./test_all.sh

if [ $? -eq 0 ]; then
  OLD_VERSION=$(grep version package.json | head -n 1 | cut -d ' ' -f 4 | sed -e 's/"//g' | sed -e 's/,//')
  # bump version to $VERSION
  sed -e "s/\"version\":\s\".*\"/\"version\": \"$VERSION\"/" -i package.json
  sed -e "s/\"version\":\s\".*\"/\"version\": \"$VERSION\"/" -i chrome_extension/manifest.json

  # commit new version
  git add package.json
  git add chrome_extension/manifest.json
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

  git checkout develop
else
    echo "Failed. test_all.sh return a non-zero exit status."
fi
