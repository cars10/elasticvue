#!/bin/sh

# Replace placeholders in app.*.js with environment variables
ELASTICSEARCH_HOST=${ELASTICSEARCH_HOST:-http://localhost}
ELASTICSEARCH_PORT=${ELASTICSEARCH_PORT:-9200}
ELASTIC_CLIENT_TYPE=${ELASTIC_CLIENT_TYPE:-default}
ELASTIC_USERNAME=${ELASTIC_USERNAME:-}
ELASTIC_PASSWORD=${ELASTIC_PASSWORD:-}

original_app_js_path="$(find /original -name 'app.*.js')"
app_js_path="$(find /usr/share/nginx/html/assets/js -name 'app.*.js')"
rm -f app_js_path
cp "$original_app_js_path" "$app_js_path"

search_str='{ELASTICSEARCH_HOST:"http:\/\/localhost",ELASTICSEARCH_PORT:"9200",ELASTIC_CLIENT_TYPE:"default",ELASTIC_USERNAME:"",ELASTIC_PASSWORD:""}'
replace_str="{ELASTICSEARCH_HOST:\"${ELASTICSEARCH_HOST}\",ELASTICSEARCH_PORT:\"${ELASTICSEARCH_PORT}\",ELASTIC_CLIENT_TYPE:\"${ELASTIC_CLIENT_TYPE}\",ELASTIC_USERNAME:\"${ELASTIC_USERNAME}\",ELASTIC_PASSWORD:\"${ELASTIC_PASSWORD}\"}"

sed -i "s#${search_str}#${replace_str}#g" "$app_js_path"
