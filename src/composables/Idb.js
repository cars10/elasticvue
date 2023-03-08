import { useConnectionStore } from '../store/connection'
import { IdbAdapter } from '../models/indexeddb'

const tables = [
  { name: 'queryHistory', indexes: ['date'] },
  { name: 'restQueryTabs', indexes: [] }
]
const dbVersion = 3

const databaseName = clusterUuid => {
  return `elasticvue-${dbVersion}-${clusterUuid}`
}

let db = null
export const useIdb = () => {
  if (!db) {
    const connectionStore = useConnectionStore()
    const clusterUuid = connectionStore.activeCluster.clusterUuid
    db = new IdbAdapter({ database: databaseName(clusterUuid), version: 3, tables })
  }
  return db
}
