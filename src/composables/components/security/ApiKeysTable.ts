import { onMounted, ref } from 'vue'
import { defineElasticsearchRequest, useElasticsearchAdapter } from '../../CallElasticsearch'
import { handleError } from '../../../helpers/error'
import { useTranslation } from '../../i18n'
import { genColumns } from '../../../helpers/tableColumns'
import { useApiKeysStore } from '../../../store/apikeys'
import { AuthType, useConnectionStore } from '../../../store/connection'

export const useApiKeysTable = (emit: any) => {

  const connectionStore = useConnectionStore()
  const apikeysStore = useApiKeysStore()

  const { callElasticsearch } = useElasticsearchAdapter()
  const apiKeys = ref<ApiKey[]>([])

  const t = useTranslation()

  const rowsPerPage = [
    { label: '10', value: 10, enabled: true },
    { label: '20', value: 20, enabled: true },
    { label: '100', value: 100, enabled: true },
    { label: '1000', value: 1000, enabled: apikeysStore.rowsPerPageAccepted, needsConfirm: true }
  ]

  const acceptRowsPerPage = (value: boolean) => (apikeysStore.rowsPerPageAccepted = value)

  const columns = genColumns([
    { label: t('security.table.id'), field: 'id', align: 'left'},
    { label: t('security.table.name'), field: 'name', align: 'left' },
    { label: t('security.table.creation'), field: 'creation', align: 'left', format: (val: number) => new Date(val).toLocaleString() },
    { label: t('security.table.expiration'), field: 'expiration', align: 'left', format: (val: number) => val ? new Date(val).toLocaleString() : 'Never' },
    { label: t('security.table.invalidated'), field: 'invalidated', align: 'center', format: (val: boolean) => val ? 'Yes' : 'No' },
    { label: t('security.table.username'), field: 'username', align: 'left' },
    { label: t('security.table.realm'), field: 'realm', align: 'left' },
    { label: t('security.table.actions'), field: 'actions', align: 'right' }
  ])
  
  class ApiKey{
    id: string
    name: string
    creation: Date
    expiration?: number
    invalidated: boolean
    username: string
    realm: string
    role_descriptors?: any
    metadata?: any
  }

  const loadApiKeys = async () => {
    try {
      const response = await callElasticsearch('getApiKeys')
      
      // Si la réponse a une structure avec api_keys
      if (response.api_keys) {
        const data = response.api_keys.map((apiKey: any) => {
          const d: ApiKey = {
            id: apiKey.id,
            name: apiKey.name,
            creation: apiKey.creation,
            expiration: apiKey.expiration,
            invalidated: apiKey.invalidated || false,
            username: apiKey.username,
            realm: apiKey.realm,
            role_descriptors: apiKey.role_descriptors,
            metadata: apiKey.metadata
          }
          return d
        })
        apiKeys.value = data
      } else {
        // Si la réponse a une structure différente (objet avec clés)
        const data = Object.keys(response).map(id => {
          const keyData = response[id]
          const d: ApiKey = {
            id,
            name: keyData.name,
            creation: keyData.creation,
            expiration: keyData.expiration,
            invalidated: keyData.invalidated || false,
            username: keyData.username,
            realm: keyData.realm,
            role_descriptors: keyData.role_descriptors,
            metadata: keyData.metadata
          }
          return d
        })
        apiKeys.value = data
      }
    } catch (e) {
      handleError(e)
    }
  }
  
  const isCurrentApiKey = (apiKey:string) => {
      const currentApiKey = connectionStore.activeCluster?.auth.authType === AuthType.apiKey ?
       connectionStore.activeCluster?.auth.authData.apiKey : 
       null
      if (currentApiKey!== null) {
        return currentApiKey === apiKey
      } else {
        return false
      }
    }

const deleteApiKey = async (id:string) => {
    try {
      const { run } = defineElasticsearchRequest({ emit, method: 'deleteApiKey' })
      const result = await run({
        params: {
          id: id
        },
        confirmMsg: t('security.apiKeys_result.delete.confirm', { name: id }),
        snackbarOptions: { body: t('security.apiKeys_result.delete.growl',  { name: id }) }
      })
      
      if (result !== true) {
        throw new Error(t('security.apiKeys_result.error.delete_failed', { name: id }))
      }

      loadApiKeys()
      emit('deleted')
    } catch (e) {
      handleError(e,true)
    }
  }
  
  onMounted(loadApiKeys)

  return {
    apiKeys,
    columns,
    deleteApiKey,
    loadApiKeys,
    rowsPerPage,
    acceptRowsPerPage,
    apikeysStore,
    isCurrentApiKey
  }
}