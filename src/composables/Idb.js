import { IdbConnection } from '../models/indexeddb'
import { useConnectionStore } from '../store/connection'

/**
 * const { queryHistory } = useIdb()
 * queryHistory.elements // []
 * queryHistory.insert({})
 */
let db = null
const dbVersion = 3
const tables = [
  { name: 'queryHistory', indexes: ['date'] },
  { name: 'restQueryTabs', indexes: [] }
]

export const useIdb = () => {
  if (db === null) {
    const connectionStore = useConnectionStore()
    const clusterUuid = connectionStore.activeCluster.clusterUuid

    db = new IdbConnection(databaseName(clusterUuid), tables)
    db.setup(dbVersion).then(() => (db.reloadAllTables()))
  }

  return {
    ...db.tables
  }
}

export const setupIdb = clusterUuid => {
  const db = new IdbConnection(databaseName(clusterUuid), tables)
  return db.setup(dbVersion).then(() => {
    return db
  })
}

const databaseName = clusterUuid => {
  return `elasticvue-${dbVersion}-${clusterUuid}`
}
