# elasticvue

> Elasticsearch frontend written in vue.js. [http://elasticvue.cars10k.de](http://elasticvue.cars10k.de)

## Usage

Use one of the following ways to run elasticvue:

**Locally**

* Checkout the repo `git clone https://github.com/cars10/elasticvue.git`
* Open the folder `cd elasticvue`
* Install dependencies `yarn install` or `npm install`
* Run the server `yarn prod`

**Docker**

Use the existing image:

* `docker run -p 8090:8090 cars10/elasticvue`

Or build the image locally:

* Checkout the repo `git clone https://github.com/cars10/elasticvue.git`
* Open the folder `cd elasticvue`
* Build `docker build -t elasticvue .`
* Run `docker run -p 8090:8090 elasticvue`
 

**Online version**

* Visit [http://elasticvue.cars10k.de](http://elasticvue.cars10k.de) or [https://elasticvue.cars10k.de](https://elasticvue.cars10k.de)

**Chrome extension**

TODO


## Elasticsearch configuration
You have to set some settings to allow connection to your elasticsearch cluster, even if you run the app locally.

Find your elasticsearch config (for example `/etc/elasticsearch/elasticsearch.yml`) and add the following lines:

```bash
# see https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-http.html
# Enable 'Access-Control-Allow-Origin' header
http.cors.enabled: true
# Add localhost to allowed hosts
http.cors.allow-origin: /https?:\/\/localhost(:[0-9]+)?/

# or, if you use the online version:
http.cors.allow-origin: /(https?:\/\/localhost(:[0-9]+)?)|(https?:\/\/elasticvue.cars10k.de)/
```

Now simply restart elasticsearch and you should be able to connect.

## Development

Setup and running

``` bash
# install dependencies
yarn install

# serve with hot reload at localhost:8080
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
