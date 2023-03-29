import ElasticsearchAdapter from '@/services/ElasticsearchAdapter'
import { ClientProvider } from '@/models/clients/ClientProvider'
import { CONNECTION_STATES } from '@/consts'
import Vue from 'vue'

export const checkHealth = async instance => {
  if (!instance) return
  const adapter = new ElasticsearchAdapter(ClientProvider.getClient(instance))

  try {
    const result = await adapter.clusterHealth()
    const body = await result.json()
    Vue.set(instance, 'status', body.status)

    const pingResult = await adapter.ping()
    const info = await pingResult.json()
    const version = info.version.number

    Vue.set(instance, 'version', version)
    Vue.set(instance, 'major_version', version[0])
  } catch (e) {
    Vue.set(instance, 'status', CONNECTION_STATES.UNKNOWN)
  }
}
