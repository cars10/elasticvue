# elasticvue

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/donate?hosted_button_id=65GDZCZTUBVRL)
[![Chrome web store](https://img.shields.io/chrome-web-store/v/hkedbapjpblbodpgbajblpnlpenaebaa?label=chrome%20extension)](https://chrome.google.com/webstore/detail/elasticvue/hkedbapjpblbodpgbajblpnlpenaebaa)
[![Edge extension](https://img.shields.io/badge/dynamic/json?label=microsoft%20edge%20add-on&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fgeifniocjfnfilcbeloeidajlfmhdlgo)](https://microsoftedge.microsoft.com/addons/detail/geifniocjfnfilcbeloeidajlfmhdlgo)
[![Firefox addon](https://img.shields.io/amo/v/elasticvue?label=firefox%20add-on)](https://addons.mozilla.org/en-US/firefox/addon/elasticvue/)
[![Docker build](https://img.shields.io/docker/image-size/cars10/elasticvue)](https://hub.docker.com/r/cars10/elasticvue)

English / [简体中文](./docs/README_CN.md)


Elasticsearch gui for your browser [https://elasticvue.com](https://elasticvue.com)

> Elasticsearch is a trademark of Elasticsearch BV, registered in the U.S. and in other countries.

[![Demo](http://static.cars10k.de/demo.gif)](http://static.cars10k.de/demo.gif)

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
It has full support for elasticsearch versions `8.x` and `7.x`. Check
the [FAQ](https://github.com/cars10/elasticvue/wiki/FAQ) for more details.

### Features

* Cluster overview
* Index & alias management
* Shard management
* Searching and editing documents
* Rest queries
* Snapshot & repository management

## Usage

You can use elasticvue in several ways:

### Desktop App - *recommended*

* [Windows .msi](https://update.elasticvue.com/download/windows/x86_64)
* [Mac x68 .dmg](https://update.elasticvue.com/download/darwin/x86_64) / [Mac aarch64 .dmg](https://update.elasticvue.com/download/darwin/aarch64)
* [Linux .AppImage](https://update.elasticvue.com/download/linux/x86_64)

### Browser extension

* [Google chrome](https://chrome.google.com/webstore/detail/elasticvue/hkedbapjpblbodpgbajblpnlpenaebaa)
* [Firefox](https://addons.mozilla.org/en-US/firefox/addon/elasticvue/)
* [Microsoft edge](https://microsoftedge.microsoft.com/addons/detail/geifniocjfnfilcbeloeidajlfmhdlgo)

### Docker

> **You have to configure your elasticsearch cluster if you want to use elasticvue via docker**

Use the [existing image](https://hub.docker.com/r/cars10/elasticvue):

```bash
docker run -p 8080:8080 --name elasticvue -d cars10/elasticvue
```

When using docker you can provide some default cluster configuration for your users. You can either set an environment
variable or provide a config file as a volume. In either case the content should be a json array of your
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

The keys `name` and `uri` are required, `username` and `password` are optional. If you want to connect with an api key
simply use that as the password and omit the username.

#### Docker with default clusters in environment variable

Example using environment variable `ELASTICVUE_CLUSTERS`:

```bash
docker run -p 8080:8080 -e ELASTICVUE_CLUSTERS='[{"name": "prod cluster", "uri": "http://localhost:9200", "username": "elastic", "password": "elastic"}]' cars10/elasticvue
```

#### Docker with default clusters in config file via volume

Example using config file volume to `/usr/share/nginx/html/api/default_clusters.json`:

```bash
echo '[{"name": "prod cluster", "uri": "http://localhost:9200", "username": "elastic", "password": "elastic"}]' > /config.json
docker run -p 8080:8080 -v /config.json:/usr/share/nginx/html/api/default_clusters.json cars10/elasticvue
```

Your users will be prompted to optionally import these clusters.

### Web version

> **You have to configure your elasticsearch cluster if you want to use elasticvue via docker**

Visit [https://app.elasticvue.com](https://app.elasticvue.com).

### Self-hosted

> **You have to configure your elasticsearch cluster if you want to use elasticvue via docker**

Please check the [wiki](https://github.com/cars10/elasticvue/wiki/Building-Elasticvue) for more information.

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
           -e "http.cors.enabled=true" \
           -e "http.cors.allow-origin=/.*/" \
           elasticsearch
```

After configuration restart your cluster and you should be able to connect.

## Browser Support

Any current version of Chrome, Firefox and Edge (Chromium) should work without issues. Safari is mostly untested so your
mileage may vary.

## Troubleshooting

Before opening an issue please try to reset elasticvue to its default settings:

1. Open the settings
2. Download a backup of your current elasticvue data
3. Click `Disconnect and reset`

This will reset all your saved filters, and you have to reconnect to your cluster. Please open
an [issue](https://github.com/cars10/elasticvue/issues/new/choose) if your problem persists.

## Comparing with other frontends

See the Wiki. [Comparing to other frontends](https://github.com/cars10/elasticvue/wiki/Comparing-to-other-frontends)

## i18n

Elasticvue is available in the following languages:

* english
* chinese (about 80% translated)

### Help wanted

I do not speak chinese and therefore rely on your help to keep the chinese translation up-to-date. Please open a PR if
you notice missing/wrong translations in the chinese version.

### Adding a new language

If you want to add a new language: translate `src/locales/en.json` and open a PR.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
