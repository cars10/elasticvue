# elasticvue

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/donate?hosted_button_id=65GDZCZTUBVRL)
[![Chrome web store](https://img.shields.io/chrome-web-store/v/hkedbapjpblbodpgbajblpnlpenaebaa?label=chrome%20extension)](https://chrome.google.com/webstore/detail/elasticvue/hkedbapjpblbodpgbajblpnlpenaebaa)
[![Edge extension](https://img.shields.io/badge/dynamic/json?label=microsoft%20edge%20add-on&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fgeifniocjfnfilcbeloeidajlfmhdlgo)](https://microsoftedge.microsoft.com/addons/detail/geifniocjfnfilcbeloeidajlfmhdlgo)
[![Firefox addon](https://img.shields.io/amo/v/elasticvue?label=firefox%20add-on)](https://addons.mozilla.org/en-US/firefox/addon/elasticvue/)
[![Docker build](https://img.shields.io/docker/image-size/cars10/elasticvue)](https://hub.docker.com/r/cars10/elasticvue)

Elasticsearch gui for your browser [https://elasticvue.com](https://elasticvue.com)

> Elasticsearch is a trademark of Elasticsearch BV, registered in the U.S. and in other countries.

[![Demo](http://static.cars10k.de/demo.gif)](http://static.cars10k.de/demo.gif?v=2)

Contents

1. [About](#about)
2. [Usage](#usage)
3. [Browser support](#browser-support)
4. [Troubleshooting](#troubleshooting)
5. [Comparing with other frontends](#comparing-with-other-frontends)
7. [i18n](#i18n)
8. [Contributing](#contributing)

## About

[Screenshots](https://elasticvue.com/features)

**Elasticvue** is a free and open-source gui for elasticsearch that you can use to manage the data in your cluster.
It supports every version of elasticsearch, even those that are EOL. Check
the [FAQ](docs/faq.md) for more details.

### Features

* Cluster overview
* Index & alias management
* Shard management
* Searching and editing documents
* Rest queries
* Snapshot & repository management
* ... and much more

## Usage

You can use elasticvue in several ways, use whatever works best for you.

| Type | Auto Update | Cluster config | Support for self signed ssl |
|------|-------------|----------------|-----------------------------|
| Desktop app | Yes | not needed | yes |
| Browser extension | Yes | not needed | partially |
| Web | Yes | required | partially |
| Self hosted | No | required | partially |
| Docker | No | required | partially |

### Desktop App - *recommended*

* [Windows .msi](https://update.elasticvue.com/download/windows/x86_64)
* [Homebrew](https://formulae.brew.sh/cask/elasticvue) / [Mac x68 .dmg](https://update.elasticvue.com/download/darwin/x86_64) / [Mac aarch64 .dmg](https://update.elasticvue.com/download/darwin/aarch64)
* [Linux .AppImage](https://update.elasticvue.com/download/linux/x86_64) / [Arch AUR](https://aur.archlinux.org/packages/elasticvue-bin)

### Browser extension

* [Google chrome](https://chrome.google.com/webstore/detail/elasticvue/hkedbapjpblbodpgbajblpnlpenaebaa)
* [Firefox](https://addons.mozilla.org/en-US/firefox/addon/elasticvue/)
* [Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/geifniocjfnfilcbeloeidajlfmhdlgo)

### Web version

> **You have to configure your elasticsearch cluster if you want to use elasticvue via docker**

Visit [https://app.elasticvue.com](https://app.elasticvue.com).

### Self-hosted

> **You have to configure your elasticsearch cluster if you want to self host elasticvue**

Please check the [docs](docs/building-elasticvue.md) for more information.

### Docker

> **You have to configure your elasticsearch cluster if you want to use elasticvue via docker**

Use the [existing image](https://hub.docker.com/r/cars10/elasticvue):

```bash
# docker hub:
docker run -p 8080:8080 --name elasticvue -d cars10/elasticvue

# ghcr.io:
docker run -p 8080:8080 --name elasticvue -d ghcr.io/cars10/elasticvue
```

When using docker you can provide default cluster configuration for your users. Clusters will automatically be imported every time you start elasticvue.
You can either set an environment variable or provide a config file as a volume. In either case the content should be a json array of your
clusters, looking like this:

```json
[
  {
    "name": "dev cluster",
    "uri": "http://localhost:9200"
  },
  {
    "name": "prod cluster",
    "uri": "http://localhost:9501",
    "username": "elastic",
    "password": "foobar"
  }
]
```

#### Possible keys

| Name | Value | Required | Example |
|------|-------|----------|---------|
| name | Name of the cluster | No | `"production"` |
| uri  | Cluster uri | Yes | `"http://localhost:9200"` |
| username | Username for basic authentication | No | `"elastic"` |
| password | Password for basic authentication | No | `"foobar"` |
| apiKey | API key for authentication | No | `"VuaCfGcBCdbkQm-e5aOx:ui2lp2axTNm5ShWDc11v6g"` |
| S3accessKeyId | AWS access key ID for IAM authentication | No | `"AKIAIOSFODNN7EXAMPLE"` |
| S3secretAccessKey | AWS secret access key for IAM authentication | No | `"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"` |
| S3sessionToken | AWS session token for temporary credentials | No | `"FQoGZXIvYXdzE...example"` |
| S3region | AWS region for IAM authentication | No | `"us-east-1"` |



#### Docker with default clusters in environment variable

Example using environment variable `ELASTICVUE_CLUSTERS`:

```bash
docker run -p 8080:8080 -e ELASTICVUE_CLUSTERS='[{"name": "prod cluster", "uri": "http://localhost:9200", "username": "elastic", "password": "elastic"}]' cars10/elasticvue
```

#### Docker with default clusters in config file via volume

Example using config file volume to `/usr/share/nginx/html/api/default_clusters.json`:

```bash
echo '[{"name": "prod cluster", "uri": "http://localhost:9200", "username": "elastic", "password": "elastic"}]' > config.json
docker run -p 8080:8080 -v config.json:/usr/share/nginx/html/api/default_clusters.json cars10/elasticvue
```

## Elasticsearch configuration

You have to [enable CORS](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-network.html) to allow
connection to your elasticsearch cluster **if you do not use the desktop app or the browser extensions**.

Find your elasticsearch configuration (for example `/etc/elasticsearch/elasticsearch.yml`) and add the following lines:

```yaml
# enable CORS
http.cors.enabled: true

# Then set the allowed origins based on how you run elasticvue. Chose only one:
# for docker / running locally
http.cors.allow-origin: "http://localhost:8080"
# online version
http.cors.allow-origin: /https?:\/\/app.elasticvue.com/

# and if your cluster uses authorization you also have to add:
http.cors.allow-headers: X-Requested-With,Content-Type,Content-Length,Authorization
```

If you use docker to run your elasticsearch cluster you can pass the options via environment variables:

```bash
docker run -p 9200:9200 \
           -e "discovery.type=single-node" \
           -e "http.cors.enabled=true" \
           -e "http.cors.allow-origin=/.*/" \
           -e "http.cors.allow-headers=X-Requested-With,Content-Type,Content-Length,Authorization" \
           docker.elastic.co/elasticsearch/elasticsearch:9.0.0
```

or `compose.yml`

```yml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:9.0.0
    ports:
      - "9200:9200"
    environment:
      - http.cors.enabled=true
      - http.cors.allow-origin="/.*/"
      - http.cors.allow-headers=X-Requested-With,Content-Type,Content-Length,Authorization
      - discovery.type=single-node
```

After configuration restart your cluster and you should be able to connect.

## Tips & Tricks

#### Deeplink to a cluster

If needed you can create a link to a cluster by name, e.g. for internal tooling: 
`/redirect_to_cluster?name=<cluster name>`

Example:

`/redirect_to_cluster?name=dev%20cluster`

Cluster names are matched case-insensitive. Fallback is the first cluster.

## Browser Support

Any current version of Chrome, Firefox and Edge should work without issues. Safari is mostly untested so your
mileage may vary.

## Troubleshooting

Before opening an issue please try to reset elasticvue to its default settings:

1. Open the settings
2. Download a backup of your current elasticvue data
3. Click `Disconnect and reset`

This will reset all your saved filters, and you have to reconnect to your cluster. Please open
an [issue](https://github.com/cars10/elasticvue/issues/new/choose) if your problem persists.

## Comparing with other frontends

See [Comparing to other frontends](docs/comparing-to-other-frontends.md).

## i18n

Elasticvue is available in the following languages:

* english
* chinese
* french
* russian
* japanese
* italian

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
