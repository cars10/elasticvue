#!/bin/sh

CONFIG_FILE_DIR=/usr/share/nginx/html/api
CONFIG_FILE_PATH=$CONFIG_FILE_DIR/default_clusters.json

if [ ! -f $CONFIG_FILE_PATH ] && [ -n "$ELASTICVUE_CLUSTERS" ]; then
  echo "> found ELASTICVUE_CLUSTERS..."
  mkdir $CONFIG_FILE_DIR
  echo "$ELASTICVUE_CLUSTERS" > $CONFIG_FILE_PATH
fi
