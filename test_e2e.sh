#!/bin/bash

TMP_PATH='./tmp/e2e'
VERSIONS=( elasticsearch-6.3.2 elasticsearch-5.6.10 )
PID=0

function testVersion {
  prepare $1
  runTests
}

function prepare {
  VERSION=$1
  echo "> Preparing $1..."
  downloadElasticsearch ${VERSION}
  configureElasticsearch ${VERSION}
  startElasticsearch ${VERSION}
  echo "> $1 is up and running."
}


function downloadElasticsearch {
  VERSION=$1
  wget -q -P ${TMP_PATH} "https://artifacts.elastic.co/downloads/elasticsearch/$VERSION.tar.gz"
  tar -xzf "$TMP_PATH/$VERSION.tar.gz" -C ${TMP_PATH}
}

function configureElasticsearch {
  VERSION=$1
  CONFIG="${TMP_PATH}/${VERSION}/config/elasticsearch.yml"
  echo "http.cors.enabled: true" >> ${CONFIG}
  echo "http.cors.allow-origin: '*'" >> ${CONFIG}
}

function startElasticsearch {
  VERSION=$1
  ${TMP_PATH}/${VERSION}/bin/elasticsearch > /dev/null 2>&1 &
  PID=$!

  retry curl -s 'http://localhost:9200' > /dev/null 2>&1
}

function stopElasticsearch {
  kill -15 ${PID}
  retryNegative curl -s 'http://localhost:9200' > /dev/null 2>&1
}


function retry {
  TIMEOUT=60
  STEPS=2

  for ((i=1;i<=$TIMEOUT;i+=$STEPS)); do
    $@

    if [ $? -eq 0 ]; then
      return
    fi

    sleep ${STEPS}
  done

  echo 'Timeout.'
  exit 1
}

function retryNegative {
  TIMEOUT=60
  STEPS=2

  for ((i=1;i<=$TIMEOUT;i+=$STEPS)); do
    $@

    if [ $? -ne 0 ]; then
      return
    fi

    sleep ${STEPS}
  done

  echo 'Timeout.'
  exit 1
}

function runTests {
  yarn test:e2e --headless
}

mkdir -p ${TMP_PATH}
for VERSION in "${VERSIONS[@]}"; do
  echo "> Testing $VERSION"
  testVersion ${VERSION}
  RESULT=$?
  stopElasticsearch
  echo ''
  if [ ${RESULT} -eq 0 ]; then
    echo "> Testing of $VERSION succeeded."
    echo ''
  else
    echo "> Testing of $VERSION failed. Stopping."
    exit 1
  fi
done
