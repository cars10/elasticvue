# FAQ

## Which versions of elasticsearch are supported?

Elasticvue always has full support for the two latest major versions of elasticsearch. Currently this means `9.x` and `8.x`.
Older versions of elasticsearch also work, but because of missing APIs some features of elasticvue might not be available.

## Which languages are supported in elasticvue?

* English
* Chinese (simplified)
* Chinese (traditional)
* French
* Italian
* Japanese
* Korean
* Russian

## How to access a cluster that uses SSL?
[Access clusters using SSL](access-clusters-using-ssl.md)

## How to build elasticvue?

[Building elasticvue](building-elasticvue.md)

## Is there a read-only mode?

No. Users can always change things by using the REST API.

If you want to restrict what users can do, log in with a user that has reduced privileges, e.g. by using a role like this:

```json
{
  "cluster": [
    "monitor"
  ],
  "indices": [
    {
      "names": [
        "*"
      ],
      "privileges": [
        "monitor",
        "read",
        "view_index_metadata"
      ]
    }
  ]
}
```
