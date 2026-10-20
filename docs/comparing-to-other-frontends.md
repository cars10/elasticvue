# Comparing to other frontends

The primary reason I wrote elasticvue is that I wanted an easy way to browse the data in my elasticsearch cluster. I wanted a simple table view that features filter, pagination and sorting just like you can view your data in other databases (for example mysql-workbench or sequelpro for mysql/mariadb).

Many frontends for elasticsearch do not offer a way to show your data in a table (for example cerebro) or they are more complicated to use (like kibana).

Elasticvue tries to fill that gap by being more "document oriented" or "data oriented" instead of "cluster oriented" like other tools.

This is a list of some similar tools with some pros and cons to compare them to elasticvue. Please open an issue if you think an important tool or point is missing or wrong.

**I really do not want to denigrate any of the tools mentioned here. This page only exists to help users choose the tool that they need. Please contact me if you think that something is not right.**

## [elasticsearch-head](https://github.com/mobz/elasticsearch-head)

pros 

* lightweight
* great query builder

cons

* unmaintained (no changes since 2021)
* no pagination or sort functionality while browsing data
* no error handling or information to help users
* not all installation methods work with recent versions of elasticsearch (docker image for example)

## [dejavu](https://github.com/appbaseio/dejavu)

pros

* maintained
* import/export of data
* great query builder and filter options
* shows your documents in a table

cons

* only provides functionality for browsing data, nothing more
* no error handling or information to help users

## [kibana](https://www.elastic.co/kibana)

pros

* official client by elastic
* integration with elasticsearch services
* does way more than showing your data (for example analytics and cluster management)

cons

* very complex and (in my experience) hard to use
* heavyweight, needs to run as a separate service

## [cerebro](https://github.com/lmenezes/cerebro)

pros

* great ui
* cluster oriented: offers everything you need to manage your cluster settings

cons

* no easy way to browse your documents (only offers manual rest calls, no table views)
* java dependency
* no release since 2021
