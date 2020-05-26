# Privacy

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
