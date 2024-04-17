import { useTranslation } from '../../i18n.ts'
import { useSearchStore } from '../../../store/search.ts'
import { computed, ref } from 'vue'
import { useModal } from '../../Modal.ts'
import { defineElasticsearchRequest } from '../../CallElasticsearch.ts'
import { stringifyJson } from '../../../helpers/json/stringify.ts'

export type SearchResultProps = { columns: any[], doc: Record<string, any> }

export const useSearchResult = (props: SearchResultProps, emit: any) => {
  const t = useTranslation()

  const searchStore = useSearchStore()
  const resultColumns = computed(() => (props.columns.slice(0, -1)))

  const edit = ref(false)
  const docInfo = () => ({
    index: props.doc._index,
    type: props.doc._type,
    id: props.doc._id,
    routing: props.doc._routing
  })
  const { openModalWith } = useModal()
  const showDocument = () => (openModalWith('get', docInfo()))

  const { run } = defineElasticsearchRequest({ emit, method: 'delete' })
  const deleteDocument = async () => {
    return run({
      params: docInfo(),
      confirmMsg: t('search.search_result.delete.confirm', 1),
      snackbarOptions: { body: t('search.search_result.delete.growl', 1) }
    })
  }

  const renderValue = (doc: any, column: string) => {
    if (!doc.hasOwnProperty(column)) return
    const value = doc[column]

    if (searchStore.localizeTimestamp && column === '@timestamp') {
      const d = Date.parse(value)
      return new Date(d).toLocaleString()
    }

    if (typeof value === 'object') {
      return stringifyJson(value)
    } else {
      return value
    }
  }

  return {
    resultColumns,
    edit,
    showDocument,
    deleteDocument,
    renderValue
  }
}