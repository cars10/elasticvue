import { onMounted, ref } from 'vue'
import { defineElasticsearchRequest, useElasticsearchAdapter } from '../../CallElasticsearch'
import { handleError } from '../../../helpers/error'
import { useTranslation } from '../../i18n'
import { genColumns } from '../../../helpers/tableColumns'
import { useApiKeysStore } from '../../../store/apikeys'

export const useApiKeysTable = (emit: any) => {

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
    { label: 'ID', field: 'id', align: 'left'},
    { label: 'Name', field: 'name', align: 'left' },
    { label: 'Creation', field: 'creation', align: 'left', format: (val: number) => new Date(val).toLocaleString() },
    { label: 'Actions', field: 'actions', align: 'right' }
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
  
  const { run } = defineElasticsearchRequest({ emit, method: 'deleteApiKey' })

  const deleteApiKey = async (id:string) => {

     return run({
      params: {
        id: id
      },
      confirmMsg: t('apiKeys.apiKeys_result.delete.confirm', 1),
      snackbarOptions: { body: t('apiKeys.apiKeys_result.delete.growl', 1) }
    })
  }

  onMounted(loadApiKeys)

  return {
    apiKeys,
    columns,
    deleteApiKey,
    loadApiKeys,
    rowsPerPage,
    acceptRowsPerPage,
    apikeysStore
  }
}