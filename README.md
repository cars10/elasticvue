# elasticvue

This branch is used to rewrite elasticvue in quasar because i am fed up with vuetify.

I will also convert everything to vue 3 and `script setup`.

Current State:

| Feature            | Status |
|--------------------|--------|
| Cluster management | Done   |
| Backup & Restore   | Done   |
| Home page          | Done   |
| Nodes              | Done   |
| Shards             | Done   |
| Indices            | Done   |
| Search             |        |
| Rest               | Done   |
| Snapshots          | Done   |
| Settings           | Done   |


Features that are no longer re-implemented:
* Nodes grid view
* Rest query vertical view
* Support for numbers bigger then `Number.MAX_SAFE_INTEGER`
* Utilities

Feature TODO:
* Rest query examples

Overall TODOs:
* Cleanup i18n
* a11y
* keyup.esc modifiers


## Makefile
`make dev` start dev server  
`make docker` build docker image   
`make test` run tests  
`make lint` run eslint  
`make tsc` run typescript checks  
`make ci` run eslint, typescript and tests