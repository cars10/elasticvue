#!/usr/bin/env bash
set -e

awslocal es create-elasticsearch-domain --domain-name my-domain

awslocal iam create-user --user-name es_user

awslocal iam put-user-policy \
  --user-name es_user \
  --policy-name es_full_access \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": "es:*",
        "Resource": "*"
      }
    ]
  }'

awslocal iam create-access-key --user-name es_user \
  > /tmp/es_user_credentials.json

echo "Elasticsearch domain 'my-domain' created."
echo "IAM user 'es_user' created with ES-full-access policy."
echo "Credentials written to /tmp/es_user_credentials.json"
