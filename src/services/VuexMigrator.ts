import { ConnectionState, ElasticsearchClusterCredentials, useConnectionStore } from '../store/connection.ts'
import { ThemeState } from '../store/theme.ts'
import { I18nState } from '../store/i18n.ts'
import { useIdbStore, useOldIdbStore } from '../db/Idb.ts'
import { toRaw } from 'vue'
import ElasticsearchAdapter from './ElasticsearchAdapter.ts'
import { clusterUuid } from '../composables/ClusterConnection.ts'
import { pinia } from '../plugins/pinia.ts'
import { setActivePinia } from 'pinia'

type PiniaData = {
  theme?: ThemeState
  language?: I18nState,
  connection: ConnectionState
}

export const migrateVuexData = async (data: string): Promise<PiniaData> => {
  const newData = {} as PiniaData
  const vuex = JSON.parse(data)

  if (vuex.theme) newData.theme = vuex.theme
  if (vuex.language) newData.language = vuex.language
  newData.connection = { activeClusterIndex: 0, clusters: [] }

  for (const cluster of (vuex.connection?.instances || [])) {
    const esAdapter = new ElasticsearchAdapter(cluster as ElasticsearchClusterCredentials);
    const pingBody: any = await esAdapter.ping();

    newData.connection.clusters.push({
      name: cluster.name,
      username: cluster.username,
      password: cluster.password,
      uri: cluster.uri,
      clusterName: '',
      version: cluster.version,
      majorVersion: cluster.major_version,
      uuid: clusterUuid(await pingBody.json()) || '',
      status: ''
    })
  }

  return newData
}

const migrateTabs = async () => {
  const { restQueryTabs } = useIdbStore()
  if (!restQueryTabs) return
  const tabs = await restQueryTabs.getAll()
  for await (const tab of tabs) {
    if (!tab.response) {
      await restQueryTabs.update(Object.assign({}, toRaw(tab), { response: { status: '', ok: false, bodyText: '' } }))
    }
  }
}

const migrateQueries = async () => {
  const oldIdbStore = await useOldIdbStore();
  const { restQuerySavedQueries } = useIdbStore();
  const savedQueries = await oldIdbStore.restQuerySavedQueries.getAll()

  for await (const savedQuery of savedQueries) {
    if (savedQuery.favorite === 1) {
      await restQuerySavedQueries.update(savedQuery)
    }
  }
}

export const migrate = async () => {
  if (localStorage.getItem('connection')) return

  const elasticvuex = localStorage.getItem('elasticvuex')
  if (!elasticvuex) return

  const store = useConnectionStore(setActivePinia(pinia));
  const migrated = await migrateVuexData(elasticvuex)
  Object.entries(migrated).forEach(([key, value]) => {
    localStorage.setItem(key, JSON.stringify(value))
  })
  store.$patch(migrated.connection);

  await migrateTabs()
  await migrateQueries()
}
