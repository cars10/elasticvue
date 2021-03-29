import store from '@/store'
import ElasticsearchAdapter from '@/services/ElasticsearchAdapter'
import { DefaultClient } from '@/models/clients/DefaultClient'

export default function cachedAdapter () {
  if (store.state.connection.elasticsearchAdapter !== null) {
    return store.state.connection.elasticsearchAdapter
  } else {
    const adapter = new ElasticsearchAdapter(new DefaultClient(store.getters['connection/activeInstance']))
    store.commit('connection/setElasticsearchAdapter', adapter)
    return adapter
  }
}
