# Debugging connection issues

Please try the following steps if you have trouble connecting to your cluster:

## 1. Check if you can connect to your cluster on the command line

Try to `curl` your cluster directly, for example

```bash
# curl an unprotected cluster
curl -X GET "http://localhost:9200"

# curl a cluster that uses ssl
curl -k -X GET "https://localhost:9200"

# curl a cluster that uses authorization
curl -k -X GET -u elastic:yourpassword "https://localhost:9200"
```

Proceed to the next step if you see a response similar to this one:
```json
{
  "name" : "cars10-thinkpad",
  "cluster_name" : "elasticsearch",
  "cluster_uuid" : "-KjsfLD2TYC36a4FvviZjA",
  "version" : {
    "number" : "8.2.2",
    "build_flavor" : "default",
    "build_type" : "tar",
    "build_hash" : "9876968ef3c745186b94fdabd4483e01499224ef",
    "build_date" : "2022-05-25T15:47:06.259735307Z",
    "build_snapshot" : false,
    "lucene_version" : "9.1.0",
    "minimum_wire_compatibility_version" : "7.17.0",
    "minimum_index_compatibility_version" : "7.0.0"
  },
  "tagline" : "You Know, for Search"
}
```

## 2. Check the configuration of your cluster

You can skip this step if you use the browser extension or the desktop app. If you use the web version, the docker image or any other self-hosted variant you **have to configure CORS for your cluster**.

`config/elasticsearch.yml`:

```yaml
http.cors.enabled: true
http.cors.allow-origin: /.*/ # or restrict it to where elasticvue runs, e.g. "http://localhost:8080"

# and if your cluster is password protected you also have to add:
http.cors.allow-headers: X-Requested-With,Content-Type,Content-Length,Authorization
```

## 3. Check if you can connect to your cluster in the browser

Try to open the url of your cluster in the browser. Open it as a regular web page, e.g. [https://localhost:9200](https://localhost:9200).
The following things could happen now:

1. **Security warning.** If your browser does not trust the SSL certificate of your cluster you will not be able to connect. See [Access clusters using SSL](access-clusters-using-ssl.md) for how to trust the certificate.
2. **Login prompt.** Enter the credentials of your elasticsearch user, for example username `elastic` and its password.

Once you get past the security warning and login (if any), you should see the same json response that you got with curl.

## 4. Try to connect in elasticvue

If you can access your cluster in the browser (and configured CORS if needed) you should be able to connect in elasticvue. If you still have issues please double-check the url (make sure to use `http` or `https` correctly) and your credentials.

If you *still* have issues try the desktop app or [open an issue](https://github.com/cars10/elasticvue/issues/new/choose). Please include the curl output and screenshots of the browser console when possible.
