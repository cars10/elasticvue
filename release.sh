#!/bin/bash

set -e

[ -z "$VERSION" ] && echo "You have to set a VERSION to run this script." && exit 1;

OLD_VERSION=$(grep version package.json | head -n 1 | cut -d ' ' -f 4 | sed -e 's/"//g' | sed -e 's/,//')
# bump version to $VERSION
sed -e "s/\"version\":\s\".*\"/\"version\": \"$VERSION\"/" -i package.json
sed -e "s/\"version\":\s\".*\"/\"version\": \"$VERSION\"/" -i chrome_extension/manifest.json

sh ./test_all.sh

if [ $? -eq 0 ]; then
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
  CHANGELOG=$(sed -n "/0.1.3/,/$OLD_VERSION/p" CHANGELOG.md | head -n -2)
  git tag -a "v$VERSION" -m "$CHANGELOG"

  # push tags
  git push --tags
else
    echo "Failed. test_all.sh return a non-zero exit status."
fi
