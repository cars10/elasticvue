# elasticvue

> Elasticsearch frontend

## Usage
Use the online version or run the app locally. In both cases you have to configure your elasticsearch cluster to allow connections.

## Elasticsearch configuration
You have to set some settings to allow connection to your elasticsearch cluster, even if you run the app locally.

Find your elasticsearch config (for example `/etc/elasticsearch/elasticsearch.yml`) and add the following lines:

```bash
# see https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-http.html
# Enable 'Access-Control-Allow-Origin' header
http.cors.enabled: true
# Add localhost to allowed hosts
http.cors.allow-origin: /https?:\/\/localhost(:[0-9]+)?/
```

Now simply restart elasticsearch and you should be able to connect.

### Run the app locally
```bash
git clone https://github.com/cars10/elasticvue.git
cd elasticvue
yarn install
yarn run dev
```

## Use the online version
The app is also hosted at [http://elasticvue.cars10k.de](http://elasticvue.cars10k.de).
You can access your local elasticsearch cluster if you make some additional configurations and add the domain to your allowed hosts.

Find your elasticsearch config (for example `/etc/elasticsearch/elasticsearch.yml`) and add the following lines:

```bash
# see https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-http.html
# Enable 'Access-Control-Allow-Origin' header
http.cors.enabled: true
# Add localhost and elasticvue.cars10k.de to allowed hosts
http.cors.allow-origin: /(https?:\/\/localhost(:[0-9]+)?)|(https?:\/\/elasticvue.cars10k.de)/
```

Based on how your cluster is accessible (with/without ssl) you should visit either

* [http://elasticvue.cars10k.de](http://elasticvue.cars10k.de) or
* [https://elasticvue.cars10k.de](https://elasticvue.cars10k.de)

because chrome will complain if you try to load data from insecure origins while visiting a secured website.

## Development

``` bash
# install dependencies
yarn install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```
