import ElasticsearchAdapter from '@/services/ElasticsearchAdapter'
import { DefaultClient } from '@/models/clients/DefaultClient'
import { CONNECTION_STATES } from '@/consts'

export const checkHealth = instance => {
  if (!instance) return
  const adapter = new ElasticsearchAdapter(new DefaultClient(instance))

  adapter
    .clusterHealth()
    .then(result => result.json())
    .then(body => (instance.status = body.status))
    .catch(() => (instance.status = CONNECTION_STATES.UNKNOWN))
}
