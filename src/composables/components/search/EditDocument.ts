import { ref, watch, Ref, computed } from 'vue'
import { useTranslation } from '../../i18n.ts'
import {
  defineElasticsearchRequest,
  useElasticsearchAdapter,
} from '../../CallElasticsearch.ts'
import { stringifyJson } from '../../../helpers/json/stringify.ts'
import { useSearchStore } from '../../../store/search.ts'

export type EditDocumentProps = {
  modelValue: boolean
} & ElasticsearchDocumentInfo

export type ElasticsearchDocumentInfo = {
  _index: string,
  _type: string,
  _id?: string,
  _routing?: string,
  _source?: object
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
  const searchStore = useSearchStore()
  const availableIndices = ref<string[]>([])
  const selectedIndex = ref(props._index)

  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const data: Ref<any> = ref(null)

  const load = () => {
    if (!props._index || !props._type || !props._id) {
      data.value = null
      return Promise.resolve()
    }
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
  watch(() => props.modelValue, async (value) => {
    ownValue.value = value
    if (value) {
      if (isNew.value) {
        if (Array.isArray(searchStore.indices)) {
          availableIndices.value = searchStore.indices
        } else if (typeof searchStore.indices === 'string') {
          try {
            const indices = await callElasticsearch('catIndices', { index: searchStore.indices, h: 'index', format: 'json' })
            availableIndices.value = indices.map((i: any) => i.index)
          } catch (e) {
            console.error(e)
            availableIndices.value = []
          }
        }
        selectedIndex.value = props._index || (availableIndices.value.length > 0 ? availableIndices.value[0] : '')
      }
      loadDocument()
    }
  })

  const buildDocumentFromMapping = (properties: any) => {
    if (!properties) return {}
    return Object.keys(properties).reduce((acc, key) => {
      acc[key] = ''
      return acc
    }, {} as Record<string, any>)
  }

  const loadIndexMapping = async (index: string) => {
    if (!index) {
      document.value = stringifyJson({})
      return
    }

    try {
      const mappingData = await callElasticsearch('indicesGetMapping', { index })
      const properties = mappingData[index]?.mappings?.properties
      const newDoc = buildDocumentFromMapping(properties)
      document.value = stringifyJson(newDoc)
    } catch (e) {
      console.error(e)
      document.value = stringifyJson({})
    }
  }

  watch(selectedIndex, (newVal) => {
    documentMeta.value._index = newVal
    if (isNew.value) {
      loadIndexMapping(newVal)
    }
  })

  const isNew = computed(() => !props._id)

  const loadDocument = async () => {
    if (isNew.value) {
      if (props._source) {
        document.value = stringifyJson(props._source)
      } else {
        await loadIndexMapping(selectedIndex.value)
      }
      documentMeta.value = {
        _index: selectedIndex.value,
        _type: props._type
      }
    } else {
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
  }

  const validDocumentMeta = computed(() => {
    return Object.fromEntries(Object.entries(documentMeta.value).filter((keyval) => keyval[1] != null))
  })

  const { run, loading } = defineElasticsearchRequest({ emit, method: 'index' })
  const saveDocument = async () => {
    const id = isNew.value ? undefined : props._id
    const index = isNew.value ? selectedIndex.value : props._index
    await run({
      params: {
        index,
        type: props._type,
        id,
        routing: props._routing
      },
      body: document.value,
      snackbarOptions: {
        body: t(isNew.value ? 'search.edit_document.create.growl' : 'search.edit_document.update.growl')
      }
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
    saveDocument,
    isNew,
    availableIndices,
    selectedIndex
  }
}