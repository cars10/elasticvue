import { defineStore } from 'pinia'
import type { ElasticsearchCluster } from './connection.ts'
import { AuthFields, sessionSecrets, withFields } from '../helpers/auth.ts'

type SessionCredentialsState = {
  byId: Record<string, AuthFields>
}

export const useSessionCredentials = defineStore('sessionCredentials', {
  state: (): SessionCredentialsState => ({ byId: {} }),
  actions: {
    set(id: string, fields: AuthFields) {
      this.byId = { ...this.byId, [id]: fields }
    },
    remove(id: string) {
      if (!(id in this.byId)) return
      const { [id]: _removed, ...rest } = this.byId
      this.byId = rest
    }
  },
  persist: {
    storage: {
      getItem: (key) => sessionStorage.getItem(key),
      setItem: (key, value) => sessionStorage.setItem(key, value)
    }
  }
})

export const needsCredentials = (cluster: Pick<ElasticsearchCluster, 'id' | 'auth'>) =>
  sessionSecrets(cluster.auth) && !useSessionCredentials().byId[cluster.id]

export const withSessionCredentials = <T extends Pick<ElasticsearchCluster, 'id' | 'auth'>>(cluster: T): T => {
  if (!sessionSecrets(cluster.auth)) return cluster

  const fields = useSessionCredentials().byId[cluster.id]
  return fields ? { ...cluster, auth: withFields(cluster.auth, fields) } : cluster
}
