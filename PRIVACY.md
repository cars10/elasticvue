# Privacy

## Update check

Starting with version `1.5.0`, elasticvue includes an update check to help ensure you're always aware of the latest
features and improvements. Each time you start elasticvue or refresh the page, it securely connects to our update server
to check if a new version is available.

To make this process more efficient, a randomly generated UUID is included with each request. This serves two important
purposes:

1. Preventing excessive requests through rate limiting
2. Helping us understand how many users are benefiting from elasticvue

No personal data or any information from your cluster is ever transmitted. The UUID is completely random and does not
contain any identifying details. This lightweight update check allows us to improve elasticvue while keeping your data
and privacy fully protected.

## Usage of personal data

Elasticvue does **not** collect or use any personal data at all.

## Usage of your elasticsearch data

Elasticvue does **not** analyze the data in your elasticsearch cluster.

Elasticvue does **not** send data from your elasticsearch cluster to any other service.

## Browser Addon Permissions

The browser addon for chrome, firefox and edge requires the following permission:

Chrome/Edge:

* *Read and change all your data on the website you visit*

Firefox:

* *Access your data for all websites*

These are different names for the same thing.
In theory, elasticvue can read and change all data on all websites you visit.
This is not what elasticvue intends to do.

**Elasticvue does not read or change any data of any websites that you visit, and it will never do that.**

The only reason for using the permission is convenience for the user. Due to this permission it is not necessary to
configure CORS in your elasticsearch cluster if you want to use the extension - you can start using elasticvue right
away without having to do any kind of configuration.

This is common practice for browser addons that directly communicate with your elasticsearch cluster.

See [#14][i14], [#17][p17] or [#18][i18] for more detailed discussion on this issue.

[i14]: https://github.com/cars10/elasticvue/issues/14

[p17]: https://github.com/cars10/elasticvue/pull/17

[i18]: https://github.com/cars10/elasticvue/issues/18
