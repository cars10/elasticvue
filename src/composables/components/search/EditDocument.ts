import { ref, watch, Ref, computed } from 'vue'
import { useTranslation } from '../../i18n.ts'
import {
  defineElasticsearchRequest,
  useElasticsearchAdapter,
} from '../../CallElasticsearch.ts'
import { stringifyJson } from '../../../helpers/json/stringify.ts'

export type EditDocumentProps = {
  modelValue: boolean
} & ElasticsearchDocumentInfo

export type ElasticsearchDocumentInfo = {
  _index: string,
  _type: string,
  _id: string,
  _routing?: string
}

type ElasticsearchDocumentMeta = {
  _index?: string,
  _type?: string,
  _id?: string,
  _version?: number,
  _primary_term?: number,
  _seq_no?: number,
  _routing?: string
}

export const useEditDocument = (props: EditDocumentProps, emit: any) => {
  const ownValue = ref(false)
  const t = useTranslation()
  const document = ref('')
  const documentMeta = ref({} as ElasticsearchDocumentMeta)

  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const data: Ref<any> = ref(null)

  const load = () => {
    return callElasticsearch('get', {
      index: props._index,
      type: props._type,
      id: props._id,
      routing: props._routing
    })
        .then(body => (data.value = body))
        .catch(() => (data.value = null))
  }

  watch(ownValue, value => (emit('update:modelValue', value)))
  watch(() => props.modelValue, value => {
    if (value) loadDocument()
    ownValue.value = value
  })

  const loadDocument = async () => {
    await load()
    document.value = stringifyJson(data.value._source)
    documentMeta.value = {
      _index: data.value._index,
      _type: data.value._type,
      _id: data.value._id,
      _version: data.value._version,
      _primary_term: data.value._primary_term,
      _seq_no: data.value._seq_no,
      _routing: data.value._routing
    }
  }

  const validDocumentMeta = computed(() => {
    return Object.fromEntries(Object.entries(documentMeta.value).filter((keyval) => keyval[1] != null))
  })

  const { run, loading } = defineElasticsearchRequest({ emit, method: 'index' })
  const updateDocument = async () => {
    await run({
      params: {
        index: props._index,
        type: props._type,
        id: props._id,
        routing: props._routing,
        params: document.value
      },
      snackbarOptions: { body: t('search.edit_document.update.growl') }
    })
    ownValue.value = false
  }

  return {
    document,
    validDocumentMeta,
    ownValue,
    loadDocument,
    requestState,
    loading,
    updateDocument
  }
}