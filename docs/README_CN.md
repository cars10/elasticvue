# elasticvue

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/donate?hosted_button_id=65GDZCZTUBVRL)
[![Chrome web store](https://img.shields.io/chrome-web-store/v/hkedbapjpblbodpgbajblpnlpenaebaa?label=chrome%20extension)](https://chrome.google.com/webstore/detail/elasticvue/hkedbapjpblbodpgbajblpnlpenaebaa)
[![Edge extension](https://img.shields.io/badge/dynamic/json?label=microsoft%20edge%20add-on&query=%24.version&url=https%3A%2F%2Fmicrosoftedge.microsoft.com%2Faddons%2Fgetproductdetailsbycrxid%2Fgeifniocjfnfilcbeloeidajlfmhdlgo)](https://microsoftedge.microsoft.com/addons/detail/geifniocjfnfilcbeloeidajlfmhdlgo)
[![Firefox addon](https://img.shields.io/amo/v/elasticvue?label=firefox%20add-on)](https://addons.mozilla.org/en-US/firefox/addon/elasticvue/)
[![Docker build](https://img.shields.io/docker/image-size/cars10/elasticvue)](https://hub.docker.com/r/cars10/elasticvue)
[![AUR version](https://img.shields.io/aur/version/elasticvue-bin?label=UNOFFICIAL%20aur)](https://aur.archlinux.org/packages/elasticvue-bin)

Elasticsearch浏览器方式的可视化客户端 [https://elasticvue.com](https://elasticvue.com)

> Elasticsearch是Elasticsearch BV的商标，已在美国和其他国家注册。

[![Demo](http://static.cars10k.de/demo.gif)](http://static.cars10k.de/demo.gif)

目录

1. [关于](#about)
2. [使用方法](#usage)
3. [浏览器支持](#browser-support)
4. [故障排除](#troubleshooting)
5. [与其他前端的比较](#comparing-with-other-frontends)
7. [国际化](#i18n)
8. [贡献](#contributing)

## 关于

[功能介绍](https://elasticvue.com/features)

**Elasticvue**是一个免费且开源的Elasticsearch图形用户界面，您可以使用它来管理集群中的数据。
它完全支持Elasticsearch版本 `8.x` 和 `7.x`。详细信息请查看
[FAQ](https://github.com/cars10/elasticvue/wiki/FAQ)。

### 功能

* 集群概览
* 索引和别名管理
* 分片管理
* 搜索和编辑文档
* REST查询
* 快照和存储库管理

## 使用方法

您可以以多种方式使用elasticvue：

* **推荐：**[Linux、Mac和Windows平台的桌面端应用](#desktop-app)

其他方式：

* [适用于Chrome、Firefox和Edge的浏览器扩展](#browser-extensions)
* [Docker镜像](#docker)
* [Web版本](#web-version)
* [自托管](#self-hosted)

### 桌面应用程序

请在[release](https://github.com/cars10/elasticvue/releases)中检查最新的桌面应用程序下载。

### 浏览器扩展

* [Google Chrome](https://chrome.google.com/webstore/detail/elasticvue/hkedbapjpblbodpgbajblpnlpenaebaa)
* [Firefox](https://addons.mozilla.org/en-US/firefox/addon/elasticvue/)
* [Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/geifniocjfnfilcbeloeidajlfmhdlgo)

单击工具栏中的图标启动elasticvue。

### Docker

*如果您使用docker运行elasticvue，则必须配置您的Elasticsearch集群*  
使用[现有镜像](https://hub.docker.com/r/cars10/elasticvue)：

```bash
docker run -p 8080:8080 --name elasticvue -d cars10/elasticvue
```

使用docker时，您可以为用户提供一些默认的集群配置。您可以设置一个环境变量或提供一个配置文件作为卷。无论哪种情况，内容都必须是一个表示集群的json数组，如下所示：

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

key`name`和`uri`是必需的，`username`和`password`是可选的。如果您想使用API密钥连接，只需将其用作密码并省略用户名。

#### 在环境变量中使用默认集群的Docker

使用环境变量`ELASTICVUE_CLUSTERS`的示例：

```bash
docker run -p 8080:8080 -e ELASTICVUE_CLUSTERS='[{"name": "prod cluster", "uri": "http://localhost:9200", "username": "elastic", "password": "elastic"}]' cars10/elasticvue
```

#### 通过卷使用配置文件中的默认集群的Docker

配置文件绑定到`/usr/share/nginx/html/api/default_clusters.json`的示例：

```bash
echo '[{"name": "prod cluster", "uri": "http://localhost:9200", "username": "elastic", "password": "elastic"}]' > /config.json
docker run -p 8080:8080 -v /config.json:/usr/share/nginx/html/api/default_clusters.json cars10/elasticvue
```

使用者将被提示是否导入这些集群的可选选项。

### Web版本

*使用elasticvue的Web版本，需要配置Elasticsearch集群*  
访问[https://app.elasticvue.com](https://app.elasticvue.com)。

### 自搭建(Self-hosted)

*自搭建elasticvue，需要配置Elasticsearch集群* 
请参考[wiki](https://github.com/cars10/elasticvue/wiki/Building-Elasticvue)了解更多信息。

## Elasticsearch配置

除了使用桌面应用程序或浏览器扩展，都必须[启用CORS](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-network.html)以允许连接到您的Elasticsearch集群。

找到您的Elasticsearch配置文件（例如`/etc/elasticsearch/elasticsearch.yml`），并添加以下行：

```yaml
# 启用CORS
http.cors.enabled: true

# 然后根据您运行elasticvue的方式设置允许的来源。
# 以下两种只选择一种：
# Docker / 本地运行
http.cors.allow-origin: "http://localhost:8080"
# 在线版本
http.cors.allow-origin: /https?:\/\/app.elasticvue.com/

# 如果您的集群使用authorization，您还必须添加：
http.cors.allow-headers: X-Requested-With,Content-Type,Content-Length,Authorization
```

如果您使用docker运行您的Elasticsearch集群，可以通过环境变量传递参数：

```bash
docker run -p 9200:9200 \
           -e "http.cors.enabled=true" \
           -e "http.cors.allow-origin=/.*/" \
           elasticsearch
```

配置完成后，重新启动集群，即可连接。

## 浏览器支持

任何当前版本的Chrome、Firefox和Edge (Chromium)应该可以正常工作。Safari大部分未经测试，因此体验可能会有所不同。

## 故障排除

在提issue之前，请尝试将elasticvue重置为默认设置：

1. 打开设置
2. 下载当前elasticvue数据的备份
3. 点击“断开连接并重置”

这将重置所有保存的过滤器，您需要重新连接到您的集群。如果问题仍然存在，请打开一个[issue](https://github.com/cars10/elasticvue/issues/new/choose)。
(用英语，作者不懂中文)
## 与其他前端工具的比较

请参阅Wiki。[与其他前端工具的比较](https://github.com/cars10/elasticvue/wiki/Comparing-to-other-frontends)

## 国际化

Elasticvue提供以下语言版本：

* 英语
* 中文（约80%翻译完成）

### 寻求帮助

我不会说中文，因此我依赖您的帮助来保持中文翻译的最新状态。如果您发现中文版本中有缺失或错误的翻译，请提交一个PR。

### 添加新语言

如果您想添加新的语言：请翻译`src/locales/en.json`并提交一个PR。

## 贡献

请参阅[CONTRIBUTING.md](CONTRIBUTING.md)。

## License

MIT