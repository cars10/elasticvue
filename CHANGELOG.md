# Changelog

## 0.14.0
* [feat] adds reload button to modals
* [feat] can switch between vertical/horizontal layout in query/api browser
* [feat] decrease navbar size when scrolled down
* updates logos

## 0.13.0
* firefox addon is now available on [addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/elasticvue/)!
* [feat] can switch between vertical/horizontal layout in query/rest
* [feat] can beautify code in readonly editor


## 0.12.0
* improvements for the code editor (json views):
    * [feat] enable searchbox for code editor
    * [feat] add beautify button to code editor (hotkey: ctrl+alt+l)
* [feat] show different "no results" text in results table based on current filters. thx @georgeyeint (see discussion in [#7][i7])
* [bug] fix switching between index pattern and index selection ([#7][i7])
* [bug] fix indices & search table not showing empty results when search result is empty

[i7]: https://github.com/cars10/elasticvue/issues/7


## 0.11.0
* [feat] can filter exact with `"` in all filter and select inputs
* [feat] async filtering for indices table and search results table (using web workers)
* [feat] adds examples to both query forms (rest and api browser)
* [feat] adds more options to snapshot creation form
* updates dependencies, most notably vuetify 2.x

## 0.10.2
* [bug] fix usage with elasticsearch `7.1.1`. thx @iDmple ([#5][i5])

[i5]: https://github.com/cars10/elasticvue/issues/5

## 0.10.1
* [bug] fix clicking search result item might open previous opened item. thx @foqq ([#4][i4])

[i4]: https://github.com/cars10/elasticvue/issues/4

## 0.10.0

* [bug] fix redirect loop in chrome extension on macos and windows. thx @foqq ([#2][i2])
* [feat] you can now switch between index selection and index patterns
* performance improvements (removes global components and mixins)
* updates dependencies

[i2]: https://github.com/cars10/elasticvue/issues/2

## 0.9.2

* cleanup after source_includes changes

## 0.9.1

* fix source_includes breaking search

## 0.9.0

* snapshot management
    * create and remove snapshot repositories
    * take and restore snapshots for all/specific indices
* updates dependencies (vue 2.6, vuetify 1.5)

## 0.8.0

* adds api-browser component
* better handling of network errors
* only search still existing indices
* removes reconnect input in toolbar
* adds/fixes some specs
* updates dependencies

## 0.7.1

* fix css issue

## 0.7.0

* added node overview
* added management options for indices
* adds timer setting to reload buttons for interval querying
* can always connect to cluster without testing

## 0.6.0

* fix css for table settings button
* fix chrome extension build script
* adds cerebro to readme

## 0.5.0

* adds logo
* adds e2e specs

## 0.4.0

* can use authorized clusters (via `username:password@host` syntax)
* can toggle table columns during search
* switch from karma to jest specs

## 0.3.0

* switch to port 8080 in development builds and docker container
* fixes some responsiveness errors
* adds ability to create indices
* adds setting to enable/disable sticky table headers
* internal refactorings to match vue style guide
* adds utility to create some test data

## 0.2.3

* switch to vue-cli-3
* refactor resizing code editors

## 0.2.2

* fix fixed table headers

## 0.2.1

* use a different lib to stringify params

## 0.2.0

* adds options to hide `_index` and `_score` columns on search page
* autoscroll page when resizing editors
* correctly build request on query page when using GET and params together
* internal state refactorings


## 0.1.8

* fix broken build

## 0.1.7

* better table resizing
* fix bug where sourceIncludes option was deleted automatically
* small performance improvement

## 0.1.6

* fix column name filter on search page

## 0.1.5

* text changes
* fix bug when reloading indices on search
* use node 10 for docker image
* adds more specs
* updates dependencies

## 0.1.4

* fixes grid sizes
* makes table headers sticky and tables scrollable
* adds filters for source includes and size on search view
* save table pagination and sort settings in store
* updates dependencies

## 0.1.3

* can connect via ctrl+enter during initial setup
* rewrote query page - you can now directly fetch your cluster
* can resize code editors
* some internal changes to be more compliant to vue best practices

## 0.1.2

* adds some basic specs
* changes urls to point to elasticvue.com
* load editor component async

## 0.1.1

* fix github dependency in package.json because docker image did not build

## 0.1.0

* updates dependencies
* fixed some bugs regarding fuzzy matching
* add better editor to view query results (ace)

## 0.0.3

* updates dependencies
* show version in footer
* renamed "browse" to "search"
* enabled fuzzy matching for all filters (tables and selects)
* reworked connection workflow

## 0.0.2

* Adds tooltip to reset button
* Adds more information on 403 errors

## 0.0.1

* initial release
