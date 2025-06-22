# Localstack Setup for ES

* Start localstack container by running `docker compose up` in this folder
    * During creation the `init-iam-es.sh` script will run creating the initial domain and user
* Once it's finished running get the credentials by calling docker exec localstack cat /tmp/es_user_credentials.json
* In elasticvue
    * Add new cluster
    * Set the Access Key ID and Secret Key to the ones from the `es_user_credentials.json`
    * Set the region to us-east-1
    * Set the URI to `http://127.0.0.1:4566/es/us-east-1/my-domain`
    * Click Connect
