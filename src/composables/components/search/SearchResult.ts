import { ref } from 'vue'
import { useTranslation } from '../../i18n.ts'
import { useSearchStore } from '../../../store/search.ts'
import { defineElasticsearchRequest } from '../../CallElasticsearch.ts'
import { truncateString } from '../../../helpers/truncate.ts'
import { DEFAULT_DOCUMENT_FIELD_MAX_LENGTH } from '../../../consts.ts'
import { formatFieldValue, getFieldValue, summarizeDocument } from '../../../helpers/search/documentValues.ts'
import { SOURCE_COLUMN } from '../../../helpers/search/columns.ts'
import { hitSource } from './SearchResultsTable.ts'
import type { FieldCatalog } from '../../../types/search.ts'
import type { EsSearchHit } from './SearchDocuments.ts'

export type SearchResultProps = { hit: EsSearchHit; columns: string[]; catalog: FieldCatalog }

const formatDate = (value: unknown) => {
  if (typeof value !== 'string' && typeof value !== 'number') return null
  const date = new Date(value)
  return isNaN(date.getTime()) ? null : date.toLocaleString()
}

export const useSearchResult = (props: SearchResultProps, emit: any) => {
  const t = useTranslation()
  const searchStore = useSearchStore()
  const edit = ref(false)

  const maxLength = () => searchStore.documentFieldMaxLength || DEFAULT_DOCUMENT_FIELD_MAX_LENGTH

  const cellValue = (column: string): string => {
    const hit = props.hit
    if (column === SOURCE_COLUMN) return summarizeDocument(hitSource(hit), maxLength())
    if (column === '_type') return hit._type || '_doc'
    if (column.startsWith('_') && column in hit) return formatFieldValue(hit[column as keyof EsSearchHit])

    const value = getFieldValue(hitSource(hit), column)
    const isDate = searchStore.localizeTimestamp && props.catalog[column]?.types.includes('date')
    const formatted = (isDate && formatDate(value)) || formatFieldValue(value)
    return truncateString(formatted, maxLength())
  }

  const { run } = defineElasticsearchRequest({ emit, method: 'delete' })
  const deleteDocument = () =>
    run({
      params: { index: props.hit._index, type: props.hit._type || '_doc', id: props.hit._id, routing: props.hit._routing },
      confirmMsg: t('search.search_result.delete.confirm', 1),
      snackbarOptions: { body: t('search.search_result.delete.growl', 1) }
    })

  let clickTimer = 0
  const onClick = (event: MouseEvent) => {
    if ((event.target as HTMLElement).closest('button, a, .q-checkbox') || window.getSelection()?.toString()) return
    window.clearTimeout(clickTimer)
    clickTimer = window.setTimeout(() => emit('open'), 250)
  }
  const onDblclick = () => {
    window.clearTimeout(clickTimer)
    edit.value = true
  }

  const buttonsVisible = ref(false)
  const onIntersection = (entry: IntersectionObserverEntry) => {
    buttonsVisible.value = entry.isIntersecting
  }

  return { edit, cellValue, deleteDocument, buttonsVisible, onIntersection, onClick, onDblclick }
}
