import ElasticsearchAdapter from '@/services/ElasticsearchAdapter'
import { DefaultClient } from '@/models/clients/DefaultClient'
import { CONNECTION_STATES } from '@/consts'

export const checkHealth = instance => {
  if (!instance) return
  const adapter = new ElasticsearchAdapter(new DefaultClient(instance))

  adapter
    .clusterHealth()
    .then(result => result.json())
    .then(body => {
      instance.status = body.status

      adapter.ping()
        .then(result => result.json())
        .then(info => {
          const version = info.version.number
          instance.version = version
          instance.major_version = version[0]
        })
    })
    .catch(() => (instance.status = CONNECTION_STATES.UNKNOWN))
}
