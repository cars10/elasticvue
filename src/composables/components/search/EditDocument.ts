import { ref, watch, Ref } from 'vue'
import { useTranslation } from '../../i18n.ts'
import {
  defineElasticsearchRequest,
  useElasticsearchAdapter,
} from '../../CallElasticsearch.ts'

export type EditDocumentProps = {
  modelValue: boolean
} & ElasticsearchDocumentInfo

export type ElasticsearchDocumentInfo = {
  _index: string,
  _type: string,
  _id: string
}

export const useEditDocument = (props: EditDocumentProps, emit: any) => {
  const ownValue = ref(false)
  const t = useTranslation()
  const document = ref('')

  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const data: Ref<any> = ref(null)

  const load = () => {
    return callElasticsearch('get', {
      index: props._index,
      type: props._type,
      id: props._id
    })
        .then(body => (data.value = body))
        .catch(() => (data.value = null))
  }

  watch(ownValue, value => (emit('update:modelValue', value)))
  watch(() => props.modelValue, value => {
    ownValue.value = value
    if (value) loadDocument()
  })

  const loadDocument = async () => {
    await load()
    document.value = JSON.stringify(data.value._source)
  }

  const { run, loading } = defineElasticsearchRequest({ emit, method: 'index' })
  const updateDocument = async () => {
    await run({
      params: {
        index: props._index,
        type: props._type,
        id: props._id,
        params: document.value
      },
      snackbarOptions: { body: t('search.edit_document.update.growl') }
    })
    ownValue.value = false
  }

  return {
    document,
    ownValue,
    loadDocument,
    requestState,
    loading,
    updateDocument
  }
}