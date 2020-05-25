#!/usr/bin/env bash

TMP_PATH=./tmp/e2e
VERSIONS=( elasticsearch-7.5.0-linux-x86_64 )
PID=0
ES_PID_FILE=${TMP_PATH}/pid
ES_PORT=$(cat cypress.json|grep ES_PORT|awk '{print $2}' | cut -d ',' -f 1)

function testVersion {
  prepare $1
  runTests
}

function prepare {
  VERSION=$1
  downloadElasticsearch ${VERSION}
  configureElasticsearch ${VERSION}
  startElasticsearch ${VERSION}
  echo ">> $VERSION is up and running."
}

function downloadElasticsearch {
  VERSION=$1
  echo ">> Downloading $VERSION..."

  # delete possible existing folder
  rm -rf ${TMP_PATH}/${VERSION}

  if [[ ! -f ${TMP_PATH}/${VERSION}.tar.gz ]]; then
    wget -q -P ${TMP_PATH} "https://artifacts.elastic.co/downloads/elasticsearch/$VERSION.tar.gz"
  fi
  tar -xzf "$TMP_PATH/$VERSION.tar.gz" -C ${TMP_PATH}
}

function configureElasticsearch {
  VERSION=$(echo ${1} | awk '{print substr($0, 0, 19)}')
  echo ">> Configuring $VERSION..."

  CONFIG="${TMP_PATH}/${VERSION}/config/elasticsearch.yml"
  echo "http.port: ${ES_PORT}" > ${CONFIG}
  echo "http.cors.enabled: true" >> ${CONFIG}
  echo "http.cors.allow-origin: '*'" >> ${CONFIG}
  echo "path.repo: '/tmp/elasticdata'" >> ${CONFIG}
  echo "node.name: 'e2e'" >> ${CONFIG}
  echo "cluster.name: 'e2e-clust'" >> ${CONFIG}
  echo "cluster.initial_master_nodes: 'e2e'" >> ${CONFIG}
}

function startElasticsearch {
  VERSION=$1

  echo ">> Starting $VERSION..."

  ${TMP_PATH}/${VERSION}/bin/elasticsearch > /dev/null 2>&1 &
  PID=$!
  echo ${PID} > ${ES_PID_FILE}

  retry curl -s "http://localhost:${ES_PORT}" > /dev/null 2>&1
  VERSION_NUMBER=$(curl -s localhost:${ES_PORT} | grep number | awk '{print $3}'| sed -e 's/"//g' | sed -e 's/,//')
  echo ">> Got version number: ${VERSION_NUMBER}"
}

function stopElasticsearch {
  kill -15 ${PID}
  retryNegative curl -s "http://localhost:${ES_PORT}" > /dev/null 2>&1
}

function retry {
  TIMEOUT=60
  STEPS=2

  for ((i=1;i<=$TIMEOUT;i+=$STEPS)); do
    $@

    if [[ $? -eq 0 ]]; then
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

    if [[ $? -ne 0 ]]; then
      return
    fi

    sleep ${STEPS}
  done

  echo 'Timeout.'
  exit 1
}

function runTests {
  yarn test:e2e --config video=false --headless
}

mkdir -p ${TMP_PATH}
for VERSION in "${VERSIONS[@]}"; do
  echo "> Testing $VERSION"
  testVersion ${VERSION}
  RESULT=$?
  stopElasticsearch
  echo ''
  if [[ ${RESULT} -eq 0 ]]; then
    echo "> Testing of $VERSION succeeded."
    echo ''
  else
    echo "> Testing of $VERSION failed. Stopping."
    exit 1
  fi
done
