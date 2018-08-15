#!/usr/bin/env bash

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
echo -ne "[0/5] Prepare..."
rm -rf dist
yarn install --silent > /dev/null
echo " Done."

# Run linter
echo -ne "[1/5] Lint..."
yarn lint > /dev/null
exitOnError

# Run specs
echo -ne "[2/5] Running unit tests..."
yarn test:unit > /dev/null
exitOnError

# Run e2e
echo -ne "[2/5] Running e2e tests..."
./test_e2e.sh > /dev/null
exitOnError


# Build for production
echo "[3/5] Building for production..."
yarn build > /dev/null
exitOnError

# Try to build docker container
echo -ne "[4/5] Building docker image..."
docker build --no-cache --quiet -t elasticvue . > /dev/null
exitOnError

echo "## Success ##"
