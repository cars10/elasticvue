#!/bin/bash
set -e

[ -z "$VERSION" ] && echo "You have to set a VERSION to run this script." && exit 1;

# bump version to $VERSION
sed -e "s/\"version\":\s\".*\"/\"version\": \"$VERSION\"/" -i package.json

# commit new version
git add package.json
git commit -am "bumps version to $VERSION"

# push new version
git push

# merge with master
git checkout master
git merge develop -m "automatic merge to finish v$VERSION"

# push master
git push

# tag new version
git tag -a "v$VERSION" -m "v$VERSION"

# push tags
git push --tags
