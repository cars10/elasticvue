import { ConnectionState } from '../store/connection.ts'
import { ThemeState } from '../store/theme.ts'
import { I18nState } from '../store/i18n.ts'

type PiniaData = {
  theme?: ThemeState
  language?: I18nState,
  connection: ConnectionState
}

export const migrateVuexData = (data: string): PiniaData => {
  const newData = {} as PiniaData
  const vuex = JSON.parse(data)

  if (vuex.theme) newData.theme = vuex.theme
  if (vuex.language) newData.language = vuex.language
  newData.connection = { activeClusterIndex: 0, clusters: [] }

  vuex.connection?.instances?.forEach((cluster: any) => {
    newData.connection.clusters.push({
      name: cluster.name,
      username: cluster.username,
      password: cluster.password,
      uri: cluster.uri,
      clusterName: '',
      version: cluster.version,
      majorVersion: cluster.major_version,
      uuid: '',
      status: ''
    })
  })

  return newData
}

export const migrate = () => {
  if (localStorage.getItem('connection')) return

  const elasticvuex = localStorage.getItem('elasticvuex')
  if (!elasticvuex) return

  const migrated = migrateVuexData(elasticvuex)
  Object.entries(migrated).forEach(([key, value]) => {
    localStorage.setItem(key, JSON.stringify(value))
  })
}
