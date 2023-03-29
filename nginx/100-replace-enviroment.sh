# Replace placeholders in app.*.js with environment variables
ELASTICSEARCH_HOST=${ELASTICSEARCH_HOST:-http://localhost}
ELASTICSEARCH_PORT=${ELASTICSEARCH_PORT:-9200}
ELASTIC_CLIENT_TYPE=${ELASTIC_CLIENT_TYPE:-default}
cp /original/app.*.js /usr/share/nginx/html/assets/js/app.*.js
if [ -z "$ELASTICSEARCH_HOST" ] && [ -z "$ELASTICSEARCH_PORT" ] && [ -z "$ELASTIC_CLIENT_TYPE" ]; then
  echo "No environment variables set. Skipping sed command."
else
  sed_cmd="ELASTICSEARCH_HOST:\"$ELASTICSEARCH_HOST\",ELASTICSEARCH_PORT:\"$ELASTICSEARCH_PORT\",ELASTIC_CLIENT_TYPE:\"$ELASTIC_CLIENT_TYPE\""

  if [ -z "$ELASTICSEARCH_HOST" ]; then
    sed_cmd="$(echo "$sed_cmd" | sed 's@ELASTICSEARCH_HOST:"[^"]\+",@@')"
  fi

  if [ -z "$ELASTICSEARCH_PORT" ]; then
    sed_cmd="$(echo "$sed_cmd" | sed 's@,ELASTICSEARCH_PORT:"[^"]\+"@@')"
  fi

  if [ -z "$ELASTIC_CLIENT_TYPE" ]; then
    sed_cmd="$(echo "$sed_cmd" | sed 's@,ELASTIC_CLIENT_TYPE:"[^"]\+"@@')"
  fi

  SEDCMD="0,/{ELASTICSEARCH_HOST:\"http:\/\/localhost\",ELASTICSEARCH_PORT:\"9200\",ELASTIC_CLIENT_TYPE:\"default\"}/{s@@{$sed_cmd}@}"
  echo "Replacing with sed: $SEDCMD in /usr/share/nginx/html/assets/js/app*.js"
  sed -i "$SEDCMD" /usr/share/nginx/html/assets/js/app*.js
fi

