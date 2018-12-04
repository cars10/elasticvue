import ConnectionService from '@/services/elasticsearch/ConnectionService'
import store from '@/store'

export const getCachedAdapter = async function () {
  let cachedAdapter = store.state.connection.elasticsearchAdapter
  if (cachedAdapter !== null) {
    return Promise.resolve(cachedAdapter)
  } else {
    let connectionService = new ConnectionService(store.state.connection.elasticsearchHost)
    let adapter = await connectionService.getAdapter()
    store.commit('connection/setElasticsearchAdapter', adapter)
    return adapter
  }
}
