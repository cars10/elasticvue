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
   // { label: t('security.table.actions'), field: 'actions', align: 'right' }
  ])
  
  class ApiKey{
    id:string
    name:string
    creation:Date
  }

  const loadApiKeys = async () => {
    try {
      const response = await callElasticsearch('getApiKeys')
      
      const data = Object.keys(response).map(id => {
        let d : ApiKey
        const roleData = response[id]
        const name = roleData.name
        const creation = roleData.creation

        d = new ApiKey()
        d = {
          id,
          name,
          creation
        }
        return  d
      })
      apiKeys.value = data 

      apiKeys.value = response.api_keys
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
        id: id + '1'
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