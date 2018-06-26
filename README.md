# elasticvue

[![Build Status](https://travis-ci.org/cars10/elasticvue.svg?branch=develop)](https://travis-ci.org/cars10/elasticvue)
[![Dependency Status](https://david-dm.org/cars10/elasticvue.svg)](https://david-dm.org/cars10/elasticvue.svg)

> Elasticsearch frontend for your browser [https://elasticvue.com](https://elasticvue.com)

![Screenshot](screenshot.png)


## About

**Elasticvue** is a frontend for elasticsearch allowing you to search and filter your clusters data right in your browser.

It works with every elasticsearch version supported by the [official elasticsearch javascript client](https://www.npmjs.com/package/elasticsearch):

* 6.X
* 5.X
* 2.X

### Features

* Cluster overview
* Indices overview, index detailed view
* Search documents
* Manually running every query supported by the official elasticsearch client
* Utilities, e.g. deleting all indices

## Usage

### Elasticsearch configuration
You have to set some settings to allow connection to your elasticsearch cluster, even if you run the app locally.

Find your elasticsearch configuration (for example `/etc/elasticsearch/elasticsearch.yml`) and add the following lines:

```yaml
# see https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-http.html
# Enable 'Access-Control-Allow-Origin' header
http.cors.enabled: true
# Then set the allowed origins based on how you run elasticvue. Chose only one:

# for docker / running locally
http.cors.allow-origin: /https?:\/\/localhost(:[0-9]+)?/
# online version
http.cors.allow-origin: /https?:\/\/app.elasticvue.com/
# chrome extension
http.cors.allow-origin: /chrome-extension:\/\/[a-z]+/

# or to enable all sources:
http.cors.allow-origin: /(https?:\/\/localhost(:[0-9]+)?)|(chrome-extension:\/\/[a-z]+)|(https?:\/\/app.elasticvue.com)/
```

Now simply restart elasticsearch and you should be able to connect.

### Running

After configuring use one of the following ways to run elasticvue:

**Online version**

* Visit [http://app.elasticvue.com](http://app.elasticvue.com) or [https://app.elasticvue.com](https://app.elasticvue.com) (if your cluster is only accessible through SSL)

**Docker**

Use the existing image:

* `docker run -p 8090:8090 -d cars10/elasticvue` [Image at Docker Hub](https://hub.docker.com/r/cars10/elasticvue) (~50mb compressed)

Or build the image locally:

* Checkout the repo `git clone https://github.com/cars10/elasticvue.git`
* Open the folder `cd elasticvue`
* Build `docker build -t elasticvue .`
* Run `docker run -p 8090:8090 elasticvue`

**Chrome extension**

Install the extension from the [chrome webstore](https://chrome.google.com/webstore/detail/elasticvue/hkedbapjpblbodpgbajblpnlpenaebaa).

**Run locally**

* Checkout the repo `git clone https://github.com/cars10/elasticvue.git`
* Open the folder `cd elasticvue`
* Install dependencies `yarn install`
* Run a production server via `yarn prod` or dev server `yarn dev`

## Browser Support

Development is done on chrome. Firefox, Safari and Edge should work but are mostly untested.

| IE | Edge | Safari | Firefox | Chrome |
|----|------|--------|---------|--------|
| None | 16+ | 11+ | 50+ | 50+ |

## Tips

* All table filters use fuzzy matching. You can also specify a single column to search in. Examples:

```bash
myquery # search in all columns for "myQuery"
index:myQuery # only search the "index" column for "myQuery"
```

* All select inputs are filterable and use fuzzy matching

## Development

Setup and running

```bash
# clone
git clone https://github.com/cars10/elasticvue.git
cd elasticvue

# install dependencies
yarn install

# serve with hot reload at localhost:8090
yarn dev
```

Other commands

```bash
# Linting
yarn lint

# minimized build for production
yarn build

# build for production and view the bundle analyzer report
yarn build --report
```

Building the chrome extension

```bash
yarn build_chrome_extension 
zip -r elasticvue.zip chrome_extension/*
```

## TODO

* save table settings (sort & pagination) in store
* specs
* remove 1000 items limit on search page
* filter options for search page
* more utilities
* ping on page load
* performance - web workers? requestIdleCallback?
* logo

## License

MIT
