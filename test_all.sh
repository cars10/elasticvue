#!/bin/bash

docker info > /dev/null
if [ $? -ne 0 ]; then
    echo "Docker is not running. Please start docker and run this script again"
    exit 1
fi

function exitOnError {
  if [ $? -eq 0 ]; then
    echo " Done."
  else
    echo " Failed."
    exit 1
fi
}

echo "## Testing Elasticvue ##"

# prepare
echo -ne "[0/4] Prepare..."
rm -rf dist
yarn install --silent > /dev/null
echo " Done."

# Run linter
echo -ne "[1/4] Lint..."
yarn lint > /dev/null
exitOnError

# Run specs
echo -ne "[2/4] Running tests..."
yarn test:unit > /dev/null
exitOnError

# Build for production
echo "[3/4] Building for production..."
yarn build > /dev/null
exitOnError

# Try to build docker container
echo -ne "[4/4] Building docker image..."
docker build --no-cache --quiet -t elasticvue . > /dev/null
exitOnError

echo "## Success ##"
