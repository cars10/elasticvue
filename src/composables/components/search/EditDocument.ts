import { ref, watch } from 'vue'
import { useTranslation } from '../../i18n.ts'
import { defineElasticsearchRequest, useElasticsearchRequest } from '../../CallElasticsearch.ts'

export const useEditDocument = ({ emit, index, type, id }: { emit: any, index: string, type: string, id: string }) => {
  const dialog = ref(false)
  const t = useTranslation()
  const document = ref('')

  const { load, requestState, data } = useElasticsearchRequest<any>('get', { index, type, id })
  watch(dialog, value => {
    if (value) loadDocument()
  })

  const loadDocument = async () => {
    await load()
    document.value = JSON.stringify(data.value._source)
  }

  const { run, loading } = defineElasticsearchRequest({ emit, method: 'index' })
  const updateDocument = async () => {
    await run({
      params: { index, type, id, params: document.value },
      snackbarOptions: { body: t('search.edit_document.update.growl') }
    })
    dialog.value = false
  }

  return {
    document,
    dialog,
    loadDocument,
    requestState,
    loading,
    updateDocument
  }
}