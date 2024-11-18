# Changelog

## 1.1.0

* update to tauri `2.0`, fixes [#228](https://github.com/cars10/elasticvue/issues/228)
* adds `auto` theme setting (default), fixes [#255](https://github.com/cars10/elasticvue/issues/255)
* adds support for `http_proxy` env variable for elasticvue desktop, fixes [#241](https://github.com/cars10/elasticvue/issues/241)

## 1.0.12

* parse kibana console queries on paste in REST editor. You can paste kibana console queries into the editor (or use the dedicated button) to fill out the form automatically.
* fix sorting issue when changing indices, fixes [#261](https://github.com/cars10/elasticvue/issues/261)

## 1.0.11

* show node version on nodes overview, fixes [#260](https://github.com/cars10/elasticvue/issues/260)
* add vim mode in editor, thanks @fqdeng, fixes [#253](https://github.com/cars10/elasticvue/pull/253)
* update chinese translation, thanks @XiangtingLee, fixes [#251](https://github.com/cars10/elasticvue/pull/251)
* adds french translation, thanks @XNxa, fixes [#250](https://github.com/cars10/elasticvue/pull/250)
* update to vue `3.5`

## 1.0.10

* fix table column size regression introduced in `1.0.9`, fixes [#245](https://github.com/cars10/elasticvue/issues/245)
* fix filtering when `null` values are present, fixes [#244](https://github.com/cars10/elasticvue/issues/244)
* reset search table sort when changing index

## 1.0.9

* improve index templates, fixes [#242](https://github.com/cars10/elasticvue/issues/242)
* improve shards table, fixes [#237](https://github.com/cars10/elasticvue/issues/237)
* fix handling of index names including `%`, fixes [#221](https://github.com/cars10/elasticvue/issues/221)
* dependency updates

## 1.0.8

* fix update&delete documents that use `routing`, fixes [#235](https://github.com/cars10/elasticvue/issues/235)
* adds shard relocation confirm msg and cancel button, fixes [#236](https://github.com/cars10/elasticvue/issues/236)
* fix ui issue with long cluster names, fixes [#230](https://github.com/cars10/elasticvue/issues/230)

## 1.0.7

This release contains no changes to elasticvue itself. It is only done to fix build issues with the macos desktop
version.

## 1.0.6

* double click to edit search results, fixes [#225](https://github.com/cars10/elasticvue/issues/225)

## 1.0.5

* adds request logging to desktop app
* fix issue when elasticsearch url ends with a slash, fixes [#214](https://github.com/cars10/elasticvue/pull/214)
* fix build setup when hosting elasticvue on a subdirectory
* fix error when showing documents that include `id` prop, fixes [#219](https://github.com/cars10/elasticvue/issues/219)
* save per_page & sort settings on indices page
* show index creation date on indices page
* warn when selecting huge page sizes
* add some query string examples
* show search query execution time
* adds "clear" button to search column selection options

## 1.0.4

* show shard size on hover, fixes [#199](https://github.com/cars10/elasticvue/pull/199)
  and [#203](https://github.com/cars10/elasticvue/pull/203)
* fix cluster selection filter, fixes [#210](https://github.com/cars10/elasticvue/issues/210)
* limit index bulk actions to 16 indices sent in chunks, fixes [#213](https://github.com/cars10/elasticvue/issues/213)

## 1.0.3

* updates chinese translations. thanks @slow-groovin! [#192](https://github.com/cars10/elasticvue/pull/192)
* don't automatically open autocomplete in editor, press `Ctrl+Space` to open,
  fixes [#189](https://github.com/cars10/elasticvue/issues/189)
* send search query with `Ctrl+Enter` when editing query, fixes [#190](https://github.com/cars10/elasticvue/issues/190)
* fix sorting in nodes table, fixes [#193](https://github.com/cars10/elasticvue/issues/193)

## 1.0.2

* fixes issue with old versions of elasticsearch that do not provide a uuid,
  fixes [#182](https://github.com/cars10/elasticvue/issues/182)
* adds document meta information when editing documents, fixes [#187](https://github.com/cars10/elasticvue/issues/187)
* remap hotkey for sending rest request to `Ctrl+Enter`, fixes [#183](https://github.com/cars10/elasticvue/issues/183)
* cache index table filter, fixes [#181](https://github.com/cars10/elasticvue/issues/181)

## 1.0.1

This release fixes some bugs that where introduced in `1.0`. It also adds the ability to configure clusters when using
elasticvue via docker.

* you can add predefined clusters when starting elasticvue via docker, check the readme for details.
  fixes [#112](https://github.com/cars10/elasticvue/issues/112)
* fix issues when showing documents if `routing` is enabled,
  fixes [#177](https://github.com/cars10/elasticvue/issues/177)
* fix issue when trying to show all shards, fixes [#174](https://github.com/cars10/elasticvue/issues/174)
* fix issue with jumping cursor in rest editor, fixes [#180](https://github.com/cars10/elasticvue/issues/180)

## 1.0.0

This is the first stable release of elasticvue `1.0`. Elasticvue now uses vue 3, vite, quasar and typescript.
This significantly improves performance in development and in production.

### FAQ

#### Which versions of elasticsearch are supported by elasticvue `1.0`?

Elasticvue always supports the two latest major versions of elasticsearch. Currently, this means `8.x` and `7.x`.
Older versions of elasticsearch should work, but you might encounter small bugs or limited features.

#### How to run elasticvue?

* Recommended: desktop app for linux, mac and windows (no cluster configuration required)
    * Download on the [releases page](https://github.com/cars10/elasticvue/releases/latest)
* Browser extension (no cluster configuration required)
    * [Google chrome](https://chrome.google.com/webstore/detail/elasticvue/hkedbapjpblbodpgbajblpnlpenaebaa)
    * [Firefox](https://addons.mozilla.org/en-US/firefox/addon/elasticvue/)
    * [Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/geifniocjfnfilcbeloeidajlfmhdlgo)
* [Docker](https://hub.docker.com/r/cars10/elasticvue) (cluster configuration **required**)
* [Web version](https://app.elasticvue.com/) (cluster configuration **required**)
* [Building manually](https://github.com/cars10/elasticvue/wiki/Building-Elasticvue) (cluster configuration
  **required**)

### Updates & new features

Elasticvue `1.0` adds many new features:

* Modernized tech stack and huge performance improvements
* Setup:
    * New welcome page
    * Adds the ability to directly import a backup
    * Improved cluster setup, can also update cluster credentials
* Home: New dashboard that includes more information about your cluster
* Indices: You can reindex indices into other indices, you can also delete all documents from and index
* Search: You are able to edit documents on the search page directly. Also values of `@timestamp` fields are localized
  by default
* Rest: Now includes tabs, history and saved queries - all saved separately per cluster.
* Snapshots: You can now create s3 repositories.
* New theme and improved accessibility
* Improved desktop version
* You can use comments in search query and rest request bodies `// some comment`
* Improved compatibility with old versions of elasticsearch. The official support is still limited to non-EOL versions,
  but older versions should work better now.

### Removed features

* Nodes grid view
* Rest query vertical view
* Utilities (these are now included in the rest query examples)

## 1.0.0-beta-7

* don't create duplicates in rest history when sending the same request again,
  fixes [#162](https://github.com/cars10/elasticvue/issues/162)
* show number of segments in indices table, fixes [#171](https://github.com/cars10/elasticvue/issues/171)
* show node attributes, fixes [#169](https://github.com/cars10/elasticvue/issues/169)

## 1.0.0-beta-6

* adds confirm when closing indices, fixes [#153](https://github.com/cars10/elasticvue/issues/153)
* link rest api docs to current version docs, fixes [#163](https://github.com/cars10/elasticvue/issues/163)
* sort shards by health, fixes [#161](https://github.com/cars10/elasticvue/issues/161)
* fixes index table filter
* replaces `ace` editor with `codemirror 6`
* more improvements for older versions of elasticvue
* dependency updates

## 1.0.0-beta-5

* re-adds `json-bigint` to support numbers bigger then `Number.MAX_SAFE_INTEGER`
* add `Hack` font
* update to node 20
* adjust mock data for tests & screenshot scripts

## 1.0.0-beta-4

* fix build issues

## 1.0.0-beta-3

* improve compatibility with older versions of elasticsearch
* improve snapshot repository creation
* various small bugfixes
* updates dependencies

## 1.0.0-beta-2

* show warning when using unsupported versions of elasticsearch
* fix issue with opening documents in search view
* save rest query tab responses

## 1.0.0-beta-1

[For downloads check the releases page](https://github.com/cars10/elasticvue/releases)

*This is a beta version. The browser addons are not updated yet, and the `:latest` tag of the docker image still points
to the previous stable version.*

This release is a complete rewrite of elasticvue in vue 3. I also switched from vue-cli to vite, from vuetify to quasar
and used typescript. Elasticvue received a lot of improvements, fixes and new features, some of the most notable are:

**New features**

* Setup: improved setup page with ability to directly import an elasticvue backup
* Home: improved dashboard with more cluster information
* Cluster management: ability to change cluster credentials
* Indices: can reindex indices into other indices and delete all documents from and index
* Search: you can now edit documents on the search page directly. Also adds a setting to localize `@timestamp` values.
* Rest: completely rewritten. Now includes tabs, history, saved queries - all saved separately per cluster.
* Snapshots: can create s3 repositories.
* New theme
* Improved desktop version
* Huge performance improvements
* Ability to use comments in search query and rest request bodies `// some comment`

**Fixes**

This release includes many, many bugfixes. Some were fixed intentionally and many where fixed by upgrading to vue 3 and
quasar.

**Removed features**

* Nodes grid view
* Rest query vertical view
* Support for numbers bigger then `Number.MAX_SAFE_INTEGER`
* Utilities (these are now included in the rest query examples)

## 0.44.1

* update dockerfile base images, fixes [#129](https://github.com/cars10/elasticvue/issues/129)

## 0.44.0

* [feat]: show content while reloading, fixes [#125](https://github.com/cars10/elasticvue/issues/125)
* [feat]: adds index templates table, fixes [#126](https://github.com/cars10/elasticvue/issues/126)
* restructure snapshots & repositories table

## 0.43.0

* [feat]: add support to connect via API key, thanks @tkdave, [#110](https://github.com/cars10/elasticvue/issues/110)
* [feat]: desktop app menu & icon fixes for mac
* [feat]: dependency updates, use vue 2.7, prepare vue 3.0 update

## 0.42.1

* fix build action

## 0.42.0

* [fix]: fix additional issues with cluster selection, fixes [#103](https://github.com/cars10/elasticvue/issues/103)
* [feat]: show `_score` in search results, fixes [#104](https://github.com/cars10/elasticvue/issues/104)

## 0.41.0

* [fix]: fix some issues with browser extensions and cluster swapping,
  fixes [#103](https://github.com/cars10/elasticvue/issues/103)

## 0.40.0

* [fix]: fix shards overview, fixes [#92](https://github.com/cars10/elasticvue/issues/92)
* [fix]: reset current page if new search has less results than current page,
  fixes [#99](https://github.com/cars10/elasticvue/issues/99)
* [fix]: adds option to disable sticky table headers, fixes [#75](https://github.com/cars10/elasticvue/issues/75)
* [feat]: change url to include cluster the id. This makes it much easier to work with different clusters in different
  browser tabs.

## 0.39.0

* [fix]: improve elasticsearch 8 support, fixes [#93](https://github.com/cars10/elasticvue/issues/93)
* [fix]: elasticsearch version not updated, fixes [#94](https://github.com/cars10/elasticvue/issues/94)
* [fix]: add additional button to reset the whole custom search body,
  fixes [#95](https://github.com/cars10/elasticvue/issues/95)
* adds support for arm64 and arm/v7, fixes [#76](https://github.com/cars10/elasticvue/issues/76)

## 0.38.0

This version includes some fixes for outdated versions of elasticsearch (like `2.x` and `5.x`).

* [fix]: support snapshots for elasticsearch < 6, fixes [#83](https://github.com/cars10/elasticvue/issues/83)
* [revert]: revert [#85](https://github.com/cars10/elasticvue/issues/85],
  fixes [#90](https://github.com/cars10/elasticvue/issues/90)

## 0.37.0

* [feat]: BETA: adds shard overview + relocation, fixes [#72](https://github.com/cars10/elasticvue/issues/72)
* [feat]: adds index bulk actions, fixes [#78](https://github.com/cars10/elasticvue/issues/78)
* [feat]: save active cluster in sessionStorage instead of localStorage,
  fixes [#81](https://github.com/cars10/elasticvue/issues/81)
* [feat]: add `track_total_hits` to default search query, fixes [#85](https://github.com/cars10/elasticvue/issues/85)
* [feat]: set page title (e.g. `elasticvue | Search`)
* [feat]: show node role explanation on hover
* [feat]: can copy node uri to clipboard in cluster selection table
* [fix]: do not add body of previous request in rest history to `GET` or `HEAD` requests
* [fix]: fix missing favicon, thanks @rdc-112
* many small improvements and bugfixes

## 0.36.4

* [fix]: syntax error in query leads to errors during result loading,
  fixes [#68](https://github.com/cars10/elasticvue/issues/68)
* [fix]: rest query bug when cluster url ends with a slash, fixes [#69](https://github.com/cars10/elasticvue/issues/69)

## 0.36.3

* [fix]: error when having an uneven amount of cpu cores, fixes [#61](https://github.com/cars10/elasticvue/issues/61)
* [fix]: reset search after failed query [#66][p66)

## 0.36.2

* [fix]: Rest requests not sending body, fixes [#65](https://github.com/cars10/elasticvue/issues/65)

## 0.36.1

* [fix]: GET requests not sending `Accept: application/json` by default

## 0.36.0

This version includes many fixes and improvements mentioned in the survey. Thanks!

* [feat]: Adds history for rest queries. The history can also be backed up and restored in the settings
* [feat]: i18n support including chinese
* [feat]: Adds button to reset the "hide indices regex" setting to default
* [feat]: When deleting an index the name of the index is now included in the confirm message
* [feat]: Adds "Copy content" button to editors
* [feat]: Can download search response as json
* [feat]: Can download rest query response as json
* [feat]: Can send a request body via GET when using rest queries
* [feat]: Cleanup code editor settings
* [feat]: Simplify footer, move link to reset settings to settings page
* [fix]: Adds tooltip to document count column in the indices table,
  fixes [#54](https://github.com/cars10/elasticvue/issues/54)
* removes link to survey, view the results [here](https://github.com/cars10/elasticvue/issues/55)
* some small css and color improvements

Big thanks to @qiwihui for the chinese translation!

## 0.35.0

* Reworks saved cluster selection to table (with pagination and filter) to improve support for users with 10+ clusters
* Can open documents in new tab by using `ctrl`+`click`. Standalone click will still open document in modal. Please
  report if this does not work on macOS.
* Adds icons for first/last page in all tables
* Adds "uncheck" button to deselect all columns in search table
* Adds additional hint to set `http.cors.allow-headers` when adding a cluster that uses authorization

## 0.34.0

* Use `json-bigint` to parse responses, fixes [#52](https://github.com/cars10/elasticvue/issues/52]. This adds support
  for displaying numbers bigger
  than `9007199254740991`. I still recommend to use strings for numbers like this if you do not need the value for
  calculations.
* Add import/export for elasticvue settings, fixes [#53](https://github.com/cars10/elasticvue/issues/53)
* Add configurable regex to hide indices, fixes [#50](https://github.com/cars10/elasticvue/issues/50]. The default value
  is `^\..*`
* Improve visibility of active buttons in code viewer/editor
* Autofocus code editor in modals
* Remove fuzzy table filtering. You can still filter specific fields when filtering search results
* Adds a link to an upcoming survey about elasticvue

## 0.33.0

* [feat]: adds hint about certificates when connecting to a cluster that uses ssl
* [feat]: more color, contrast and a11y improvements
* updates addon setup and configuration. We now need a separate manifest for chrome because of the new manifest v3
  spec. (This might cause issues, please do not hesitate to open an issue on github!)
* updates dependencies
* removes component specs, these need to be rewritten after upgrading vue & vuetify

## 0.32.0

* [feat]: adds ability to completely customize the search query,
  fixes [#42](https://github.com/cars10/elasticvue/issues/42)
* [feat]: adds autocomplete to editors on `Seach` and `Rest` pages (it is *not* context sensitive)
* [feat]: change forms to connect/add a cluster, adds dedicated fields for username and password. This should fix any
  issues with passwords that are not urlsafe, fixes [#43](https://github.com/cars10/elasticvue/issues/43)
* [feat]: small color changes to improve a11y and contrast
* converted the remaining components to the new vue composition api

## 0.31.0

* [feat]: support `_bulk` api, fixes [#39](https://github.com/cars10/elasticvue/issues/39)
* [feat]: can show, add and remove index aliases, fixes [#38](https://github.com/cars10/elasticvue/issues/38)
* [feat]: can rename elasticsearch instances, fixes [#41](https://github.com/cars10/elasticvue/issues/41)
* [feat]: adds `x` to all modals

## 0.30.1

The only change in this release is a fix to the Dockerfile. The docker image should build again.

## 0.30.0

For this release i rewrote almost all components to use the new vue composition api. The rewrite improves the
performance and prepares elasticvue for the update to vuejs 3, but might have added some bugs. Please reach out if you
encounter any issues!

* [feat]: can add multiple elasticsearch instances, fixes [#35](https://github.com/cars10/elasticvue/issues/35)
* [feat]: adds "copy error" button to error messages
* [feat]: can search indices by clicking on their name in the indices table
* [feat]: cleanup tables and remove "sticky header" option. The tables now always use a sticky header

## 0.26.0

* [feat]: can host elasticvue inside subdirectory, fixes [#31](https://github.com/cars10/elasticvue/issues/31)

## 0.25.0

This is a re-release of 0.24.0 because i made a mistake publishing it.

## 0.24.0

* [fix]: fix sorting on search page ASC/DESC beeing the wrong way around
* [fix]: fix opening documents with ids containing a forward slash (`/`),
  fixes [#29](https://github.com/cars10/elasticvue/issues/29)

## 0.23.1

* [fix]: fix parsing issue when indices are closed [#28](https://github.com/cars10/elasticvue/issues/28)

## 0.23.0

* [feat]: initial support for elasticsearch 8, fix [#23](https://github.com/cars10/elasticvue/issues/23)
* [feat]: hide the *request body* input when doing rest queries as GET or HEAD,
  fixes [#26](https://github.com/cars10/elasticvue/issues/26)
* [fix]: fix sorting indices by storage. now takes units into consideration,
  fixes [#24](https://github.com/cars10/elasticvue/issues/24)

## 0.22.0

* [feat]: change searching to use elasticsearch pagination+sort. **this limits the filter to the current
  page.** [#20](https://github.com/cars10/elasticvue/issues/20)
* [feat]: can click on index aliases on index overview to directly search
* [fix]: fix showing index info/stats not always showing the correct result in modal
* remove the deprecated [elasticsearch](https://www.npmjs.com/package/elasticsearch) library and api browser page.
  see [#22](https://github.com/cars10/elasticvue/issues/22] for details

## 0.21.0

* [fix]: adds support for hosts with path/subdirectory where elasticsearch is not available at the url root, for
  example `example.com/elasticsearch` ([#19](https://github.com/cars10/elasticvue/issues/19))

## 0.20.0

This version removes the need to configure CORS **if you use one of the browser extensions**. I am not entirely happy
with this change, but after some discussion ([#14](https://github.com/cars10/elasticvue/issues/14], [#17][p17)) i think
we i should prioritize usability in this
case.

**You still have to configure CORS if you use the docker image or the web version of elasticvue.**

## 0.19.0

* beautify code on paste (for rest and api browser)
* improve visibility of modal dialogs
* add edge extension, thx @yoke88, fixes [#15](https://github.com/cars10/elasticvue/issues/15)
* add docker environment variables example to configure page

## 0.18.0

* The docker image now uses nginx to host elasticvue instead of express. This decreases the image size and increases
  performance.
* updates vuetify. this changes the colors of the dark theme,
  see [vuetify](https://github.com/vuetifyjs/vuetify/releases/tag/v2.2.6)
* rework snapshot and repository management
* ui improvements for navbar and indices table

### 0.17.0

* [feat] show index aliases on index overview, fixes [#13](https://github.com/cars10/elasticvue/issues/13)
* use node 12

### 0.16.2

* [fix] fix connecting to servers on port 80 and 443 [#11](https://github.com/cars10/elasticvue/issues/11)
* increase width of `host` input field in setup form

### 0.16.1

* [fix] fix connecting with passwords with special characters [#10](https://github.com/cars10/elasticvue/issues/10)

### 0.16.0

* [merge] merge fix, thx @cengler [#9](https://github.com/cars10/elasticvue/issues/9)
* updates dependencies
* supported elasticsearch versions: `5.6`, `6.8`, `7.0`, `7.1`, `7.2`, `7.3`, `7.4`, `7.5`

### 0.15.0

* [fix] fix [#8](https://github.com/cars10/elasticvue/issues/8)
* [fix] fix exact filtering (using `"query"`) when filtering for fields that contain uppercase characters
* [fix] fix filtering for numbers

### 0.14.0

* [feat] adds reload button to modals
* [feat] can switch between vertical/horizontal layout in query/api browser
* [feat] decrease navbar size when scrolled down
* updates logos

### 0.13.0

* firefox addon is now available on [addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/elasticvue/)!
* [feat] can switch between vertical/horizontal layout in query/rest
* [feat] can beautify code in readonly editor

### 0.12.0

* improvements for the code editor (json views):
    * [feat] enable searchbox for code editor
    * [feat] add beautify button to code editor (hotkey: ctrl+alt+l)
* [feat] show different "no results" text in results table based on current filters. thx @georgeyeint (see discussion
  in [#7](https://github.com/cars10/elasticvue/issues/7))
* [bug] fix switching between index pattern and index selection ([#7](https://github.com/cars10/elasticvue/issues/7))
* [bug] fix indices & search table not showing empty results when search result is empty

### 0.11.0

* [feat] can filter exact with `"` in all filter and select inputs
* [feat] async filtering for indices table and search results table (using web workers)
* [feat] adds examples to both query forms (rest and api browser)
* [feat] adds more options to snapshot creation form
* updates dependencies, most notably vuetify 2.x

### 0.10.2

* [bug] fix usage with elasticsearch `7.1.1`. thx @iDmple ([#5](https://github.com/cars10/elasticvue/issues/5))

### 0.10.1

* [bug] fix clicking search result item might open previous opened item. thx
  @foqq ([#4](https://github.com/cars10/elasticvue/issues/4))

### 0.10.0

* [bug] fix redirect loop in chrome extension on macos and windows. thx
  @foqq ([#2](https://github.com/cars10/elasticvue/issues/2))
* [feat] you can now switch between index selection and index patterns
* performance improvements (removes global components and mixins)
* updates dependencies

### 0.9.2

* cleanup after source_includes changes

### 0.9.1

* fix source_includes breaking search

### 0.9.0

* snapshot management
    * create and remove snapshot repositories
    * take and restore snapshots for all/specific indices
* updates dependencies (vue 2.6, vuetify 1.5)

### 0.8.0

* adds api-browser component
* better handling of network errors
* only search still existing indices
* removes reconnect input in toolbar
* adds/fixes some specs
* updates dependencies

### 0.7.1

* fix css issue

### 0.7.0

* added node overview
* added management options for indices
* adds timer setting to reload buttons for interval querying
* can always connect to cluster without testing

### 0.6.0

* fix css for table settings button
* fix chrome extension build script
* adds cerebro to readme

### 0.5.0

* adds logo
* adds e2e specs

### 0.4.0

* can use authorized clusters (via `username:password@host` syntax)
* can toggle table columns during search
* switch from karma to jest specs

### 0.3.0

* switch to port 8080 in development builds and docker container
* fixes some responsiveness errors
* adds ability to create indices
* adds setting to enable/disable sticky table headers
* internal refactorings to match vue style guide
* adds utility to create some test data

### 0.2.3

* switch to vue-cli-3
* refactor resizing code editors

### 0.2.2

* fix fixed table headers

### 0.2.1

* use a different lib to stringify params

### 0.2.0

* adds options to hide `_index` and `_score` columns on search page
* autoscroll page when resizing editors
* correctly build request on query page when using GET and params together
* internal state refactorings

### 0.1.8

* fix broken build

### 0.1.7

* better table resizing
* fix bug where sourceIncludes option was deleted automatically
* small performance improvement

### 0.1.6

* fix column name filter on search page

### 0.1.5

* text changes
* fix bug when reloading indices on search
* use node 10 for docker image
* adds more specs
* updates dependencies

### 0.1.4

* fixes grid sizes
* makes table headers sticky and tables scrollable
* adds filters for source includes and size on search view
* save table pagination and sort settings in store
* updates dependencies

### 0.1.3

* can connect via ctrl+enter during initial setup
* rewrote query page - you can now directly fetch your cluster
* can resize code editors
* some internal changes to be more compliant to vue best practices

### 0.1.2

* adds some basic specs
* changes urls to point to elasticvue.com
* load editor component async

### 0.1.1

* fix github dependency in package.json because docker image did not build

### 0.1.0

* updates dependencies
* fixed some bugs regarding fuzzy matching
* add better editor to view query results (ace)

### 0.0.3

* updates dependencies
* show version in footer
* renamed "browse" to "search"
* enabled fuzzy matching for all filters (tables and selects)
* reworked connection workflow

### 0.0.2

* Adds tooltip to reset button
* Adds more information on 403 errors

### 0.0.1

* initial release
