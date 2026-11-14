# Elasticsearch 8 and newer

You **can** use elasticvue to connect to an elasticsearch 8 (or newer) cluster. Starting with elasticsearch 8 the following defaults changed:

* Security is enabled by default, you can no longer access the cluster without logging in
* SSL is enabled by default, make sure that your browser trusts the certificate

## What this means

You can no longer simply connect to a cluster by entering `http://localhost:9200` and clicking "connect".

## What you have to do

1. You need the credentials for your cluster
2. Your browser needs to trust the ssl certificate used by your cluster

### 1. Credentials

Elasticsearch generates a password for the `elastic` user when you start the cluster for the first time. Check the logs and **save the password**.
You can change the password if needed:

```bash
bin/elasticsearch-reset-password -u elastic -i
```

### 2. SSL Certificate

You have to import the CA that was used to generate the certificate. See [Access clusters using SSL](access-clusters-using-ssl.md) (Option 2).

Once your browser trusts the SSL certificate, use the `elastic` user and the provided password to login via elasticvue.

## Alternative (disable security)

Setting `xpack.security.enabled: false` (in `elasticsearch.yml`, or as an environment variable when using docker) restores the behaviour of elasticsearch 7 (no auth, no SSL needed). **Never use this for publicly exposed clusters.**
