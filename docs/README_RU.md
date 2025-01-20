# elasticvue

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/donate?hosted_button_id=65GDZCZTUBVRL)
[![Chrome web store](https://img.shields.io/chrome-web-store/v/hkedbapjpblbodpgbajblpnlpenaebaa?label=chrome%20extension)](https://chrome.google.com/webstore/detail/elasticvue/hkedbapjpblbodpgbajblpnlpenaebaa)
[![Edge extension](https://img.shields.io/badge/dynamic/json?label=microsoft%20edge%20add-on&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fgeifniocjfnfilcbeloeidajlfmhdlgo)](https://microsoftedge.microsoft.com/addons/detail/geifniocjfnfilcbeloeidajlfmhdlgo)
[![Firefox addon](https://img.shields.io/amo/v/elasticvue?label=firefox%20add-on)](https://addons.mozilla.org/en-US/firefox/addon/elasticvue/)
[![Docker build](https://img.shields.io/docker/image-size/cars10/elasticvue)](https://hub.docker.com/r/cars10/elasticvue)

Английский / [简体中文](./docs/README_CN.md) / [Русский](./README_RU.md)

Elasticsearch GUI для вашего браузера [https://elasticvue.com](https://elasticvue.com)

> Elasticsearch является товарным знаком Elasticsearch BV, зарегистрированным в США и других странах.

[![Demo](http://static.cars10k.de/demo.gif)](http://static.cars10k.de/demo.gif)

Содержание

1. [О проекте](#о-проекте)
2. [Использование](#использование)
3. [Поддержка браузеров](#поддержка-браузеров)
4. [Устранение неполадок](#устранение-неполадок)
5. [Сравнение с другими фронтендами](#сравнение-с-другими-фронтендами)
7. [i18n](#i18n)
8. [Вклад в проект](#вклад-в-проект)

## О проекте

[Скриншоты](https://elasticvue.com/features)

**Elasticvue** — это бесплатный и открытый графический интерфейс для Elasticsearch, который можно использовать для управления данными в вашем кластере. Он полностью поддерживает версии Elasticsearch `8.x` и `7.x`. Подробности можно узнать в [FAQ](https://github.com/cars10/elasticvue/wiki/FAQ).

### Возможности

* Обзор кластера
* Управление индексами и алиасами
* Управление шардами
* Поиск и редактирование документов
* REST-запросы
* Управление снимками и репозиториями

## Использование

Вы можете использовать elasticvue несколькими способами:

### Приложение для ПК - *рекомендуется*

* [Windows .msi](https://update.elasticvue.com/download/windows/x86_64)
* [Mac x68 .dmg](https://update.elasticvue.com/download/darwin/x86_64) / [Mac aarch64 .dmg](https://update.elasticvue.com/download/darwin/aarch64)
* [Linux .AppImage](https://update.elasticvue.com/download/linux/x86_64)

### Расширение для браузера

* [Google Chrome](https://chrome.google.com/webstore/detail/elasticvue/hkedbapjpblbodpgbajblpnlpenaebaa)
* [Firefox](https://addons.mozilla.org/en-US/firefox/addon/elasticvue/)
* [Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/geifniocjfnfilcbeloeidajlfmhdlgo)

### Docker

> **Вам нужно настроить ваш кластер Elasticsearch, если вы хотите использовать elasticvue через Docker**

Используйте [существующий образ](https://hub.docker.com/r/cars10/elasticvue):

```bash
docker run -p 8080:8080 --name elasticvue -d cars10/elasticvue
```

При использовании Docker вы можете предоставить пользователям конфигурацию кластера по умолчанию. 
Вы можете либо задать переменную окружения, либо предоставить конфигурационный файл через том. 
В любом случае содержимое должно быть массивом JSON с вашими кластерами, например:

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

Ключи `name` и `uri` обязательны, `username` и `password` опциональны. 
Если вы хотите подключиться с помощью API-ключа, используйте его как пароль и опустите имя пользователя.

#### Docker с кластерами по умолчанию в переменной окружения

Пример использования переменной окружения `ELASTICVUE_CLUSTERS`:

```bash
docker run -p 8080:8080 -e ELASTICVUE_CLUSTERS='[{"name": "prod cluster", "uri": "http://localhost:9200", "username": "elastic", "password": "elastic"}]' cars10/elasticvue
```

#### Docker с кластерами по умолчанию в конфигурационном файле через том

Пример использования конфигурационного файла через том в `/usr/share/nginx/html/api/default_clusters.json`:

```bash
echo '[{"name": "prod cluster", "uri": "http://localhost:9200", "username": "elastic", "password": "elastic"}]' > /config.json
docker run -p 8080:8080 -v /config.json:/usr/share/nginx/html/api/default_clusters.json cars10/elasticvue
```

Ваши пользователи получат запрос на импорт этих кластеров.

### Веб-версия

> **Вам нужно настроить ваш кластер Elasticsearch, если вы хотите использовать elasticvue через Docker**

Посетите [https://app.elasticvue.com](https://app.elasticvue.com).

### Self-hosted

> **Вам нужно настроить ваш кластер Elasticsearch, если вы хотите использовать elasticvue через Docker**

Вольспользуйтесь [wiki](https://github.com/cars10/elasticvue/wiki/Building-Elasticvue) для подробной информации.

## Elasticsearch configuration

Вам необходимо [включить CORS](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-network.html) чтобы разрешить подключение к вашему кластеру Elasticsearch
**если вы не используете приложение для ПК или расширения для браузера**.

Найдите конфигурацию Elasticsearch (например `/etc/elasticsearch/elasticsearch.yml`) и добавьте следующие строки:

```yaml
# включить CORS
http.cors.enabled: true

# Затем установите разрешенные источники в зависимости от того, как вы запускаете elasticvue. Выберите только один:
# для docker / локального запуска
http.cors.allow-origin: "http://localhost:8080"
# онлайн-версия
http.cors.allow-origin: /https?:\/\/app.elasticvue.com/

# и если ваш кластер использует авторизацию, также добавьте:
http.cors.allow-headers: X-Requested-With,Content-Type,Content-Length,Authorization
```

Если вы используете Docker для запуска вашего кластера Elasticsearch, вы можете передать параметры через переменные окружения:

```bash
docker run -p 9200:9200 \
           -e "http.cors.enabled=true" \
           -e "http.cors.allow-origin=/.*/" \
           elasticsearch
```

После настройки перезапустите ваш кластер, и вы сможете подключиться.

## Поддержка браузеров

Любая текущая версия Chrome, Firefox и Edge (Chromium) должна работать без проблем. 
Safari практически не тестировался, поэтому результаты могут отличаться.

## Устранение неполадок

Перед открытием проблемы попробуйте сбросить elasticvue к настройкам по умолчанию:

1. Откройте настройки
2. Скачайте резервную копию текущих данных elasticvue
3. Нажмите `Отключиться и сбросить`

Это сбросит все ваши сохраненные фильтры, и вам придется заново подключиться к вашему кластеру. 
Пожалуйста, откройте [проблему](https://github.com/cars10/elasticvue/issues/new/choose), если проблема сохраняется.

## Сравнение с другими фронтендами

См. Wiki. [Comparing to other frontends](https://github.com/cars10/elasticvue/wiki/Comparing-to-other-frontends)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT