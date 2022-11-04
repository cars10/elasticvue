# elasticvue

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/donate?hosted_button_id=65GDZCZTUBVRL)
[![Chrome web store](https://img.shields.io/chrome-web-store/v/hkedbapjpblbodpgbajblpnlpenaebaa?label=chrome%20extension)](https://chrome.google.com/webstore/detail/elasticvue/hkedbapjpblbodpgbajblpnlpenaebaa)
[![Edge extension](https://img.shields.io/badge/dynamic/json?label=microsoft%20edge%20add-on&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fgeifniocjfnfilcbeloeidajlfmhdlgo)](https://microsoftedge.microsoft.com/addons/detail/geifniocjfnfilcbeloeidajlfmhdlgo)
[![Firefox addon](https://img.shields.io/amo/v/elasticvue?label=firefox%20add-on)](https://addons.mozilla.org/en-US/firefox/addon/elasticvue/)
[![Docker build](https://img.shields.io/docker/image-size/cars10/elasticvue)](https://hub.docker.com/r/cars10/elasticvue)
[![AUR version](https://img.shields.io/aur/version/elasticvue-bin?label=UNOFFICIAL%20aur)](https://aur.archlinux.org/packages/elasticvue-bin)

Elasticsearch gui for your browser [https://elasticvue.com](https://elasticvue.com)

> Elasticsearch is a trademark of Elasticsearch BV, registered in the U.S. and in other countries.

[![Demo](http://static.cars10k.de/demo.gif)](http://static.cars10k.de/demo.gif)

Contents

1. [About](#about)
2. [Usage](#usage)
3. [Browser support](#browser-support)
4. [Troubleshooting](#troubleshooting)
5. [Comparing with other frontends](#comparing-with-other-frontends)
6. [Development](#development)
7. [i18n](#i18n)
8. [Contributing](#contributing)

## About

**Elasticvue** is a free and open-source gui for elasticsearch, allowing you to search and filter your clusters data
right in your browser.
[Screenshots](https://elasticvue.com/features)

It officially works with the following elasticsearch versions:

* `8.x` see [Elasticsearch 8](https://github.com/cars10/elasticvue/wiki/Elasticsearch-8)
* `7.x`

It also provides limited support for the following, outdated versions:

* `6.8`
* `5.6`

Check the [FAQ](https://github.com/cars10/elasticvue/wiki/FAQ) for more details.

### Features

* Cluster overview
* Index & alias management
* Shard overview, shard relocation
* Searching and filtering documents
* Manually running any query against your cluster
* Snapshot + repository management
* Utilities, e.g. deleting all indices

## Usage

### Running

You can use one of the following ways to run elasticvue:

**Browser extensions**

* Chrome: Install the extension from
  the [chrome webstore](https://chrome.google.com/webstore/detail/elasticvue/hkedbapjpblbodpgbajblpnlpenaebaa)
* Edge (2020): Install the extension from
  the [microsoft webstore](https://microsoftedge.microsoft.com/addons/detail/geifniocjfnfilcbeloeidajlfmhdlgo)
* Firefox: Install the extension from [addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/elasticvue/)

Start elasticvue by clicking on the icon in your toolbar.

**Docker**

Use the existing image:

* `docker run -p 8080:8080 -d cars10/elasticvue` [Image at Docker Hub](https://hub.docker.com/r/cars10/elasticvue) (~
  10mb compressed)

Or build the image locally:

* Checkout the repo `git clone https://github.com/cars10/elasticvue.git`
* Open the folder `cd elasticvue`
* Build `docker build -t elasticvue .`
* Run `docker run -p 8080:8080 elasticvue`

Or use `docker-compose`:

* `docker-compose up -d`

Then open [http://localhost:8080](http://localhost:8080) in your browser.

**Online version**

Visit [https://app.elasticvue.com](https://app.elasticvue.com).

**Run locally**

* Checkout the repo `git clone https://github.com/cars10/elasticvue.git`
* Open the folder `cd elasticvue`
* Install dependencies `yarn install`
* Run a production server via `yarn prod` or dev server `yarn serve`

Alternatively run `yarn build` and host the assets yourself. Example nginx config for hosting on `example.com/`:

```
server {
  listen 80;
  server_name example.com;
  root /var/www/elasticvue/dist;
  location / {
    try_files $uri $uri/ /index.html?$args;
  }
}
```

**Run locally with subdirectory**

If you want to host elasticvue under a subdirectory (like `www.example.com/elasticvue`) then you have to set the
`VUE_APP_PUBLIC_PATH` environment variable while building elasticvue. **The URL has to start and end with a slash!**

```bash
VUE_APP_PUBLIC_PATH=/elasticvue/ yarn build
```

You also need to adjust your webserver config, for example:

```
server {
    listen 80;
    server_name _;

    root /var/www/elasticvue/dist;
    location ^~ /elasticvue {
        alias /var/www/elasticvue/dist;
        try_files $uri $uri/ /index.html?$args;
    }
}
```

See the [official vuejs deployment guide](https://cli.vuejs.org/guide/deployment.html#docker-nginx) for more details.

### Elasticsearch configuration

You have to [enable CORS](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-network.html) to allow
connection to your elasticsearch cluster **if you do not use the browser extensions**.

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

This also works for `docker-compose`:

```yaml
services:
  elasticsearch:
    image: elasticsearch
    environment:
      - http.cors.enabled=true
      - http.cors.allow-origin=/.*/
    ports:
      - 9200:9200
```

After configuration restart your cluster and you should be able to connect.

## Browser Support

Please use an up-to-date version of:

* Chrome / Chromium
* Firefox
* Edge (2020, Chrome based)

## Troubleshooting

Before opening an issue please try to reset elasticvue to its default settings:

1. Open the settings
2. Download a backup of your current elasticvue data
3. Click `Disconnect and reset`

This will reset all your saved filters, and you have to reconnect to your cluster. Feel free to open
an [issue](https://github.com/cars10/elasticvue/issues/new/choose) if your problem persists.

## Comparing with other frontends

See the Wiki. [Comparing to other frontends](https://github.com/cars10/elasticvue/wiki/Comparing-to-other-frontends)

## Development

*Please make sure to use node `14.x`*

Setup and running

```bash
# clone
git clone https://github.com/cars10/elasticvue.git
cd elasticvue

# install dependencies
yarn install

# serve with hot reload at localhost:8080
yarn serve

# tests
yarn test:unit   # add --watch to watch test files

# for e2e tests you need a running elasticsearch server on port 9123
yarn test:e2e    # add --headless for headless mode
```

Other commands

```bash
# linting
yarn lint

# minimized build for production
yarn build

# create bundle size report at dist/report.html, dist/legacy-report.html
yarn build --report
```

Building the chrome/firefox extensions: (Hint: you
need [web-ext](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext) for the firefox
extension to build)

```bash
yarn build_browser_extensions
```

## i18n

Elasticvue is available in the following languages:

* english
* chinese

### Help wanted

I do not speak chinese and therefore rely on your help to keep the chinese translation up-to-date. Please open a PR if
you notice missing/wrong translations in the chinese version.

### Adding a new language

If you want to add a new language: translate `src/locales/en.json` and open a PR.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## TODO

### Road to 1.0

* upgrade to vue 3. Blocked by vuetify (not compatible yet)
* add support to directly edit/delete document [#30][f30]
* support client certificates when connecting to elasticsearch cluster [#33][f33]

[f30]: https://github.com/cars10/elasticvue/issues/30

[f33]: https://github.com/cars10/elasticvue/issues/33

### Future

* cluster settings
* data import/export

### Internal stuff and refactorings

* add more specs

## License

MIT
