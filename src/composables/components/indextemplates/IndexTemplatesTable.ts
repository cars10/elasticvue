import { useTranslation } from '../../i18n'
import { computed } from 'vue'
import { genColumns } from '../../../helpers/tableColumns'
import { filterItems } from '../../../helpers/filters.ts'
import { setupFilterState } from '../shared/FilterState.ts'
import { useIndexTemplatesStore } from '../../../store/indexTemplates.ts'
import type { IndexTemplate } from '../../../types/indexTemplates.ts'

export type IndexTemplatesTableProps = {
  indexTemplates: IndexTemplate[]
}

export const FILTER_COLUMNS = ['name', 'type', 'indexPatterns', 'composedOf']

export const useIndexTemplatesTable = (props: IndexTemplatesTableProps) => {
  const t = useTranslation()
  const indexTemplatesStore = useIndexTemplatesStore()

  const results = computed(() => props.indexTemplates)
  const filteredItems = computed(() => filterItems(results.value, indexTemplatesStore.filter, FILTER_COLUMNS))
  const filterStateProps = setupFilterState(results, filteredItems)

  const columns = genColumns([
    { label: '' },
    { label: t('index_templates.index_templates_table.table.headers.name'), field: 'name' },
    { label: t('index_templates.index_templates_table.table.headers.type'), field: 'type' },
    { label: t('index_templates.index_templates_table.table.headers.index_patterns') },
    { label: t('index_templates.index_templates_table.table.headers.priority'), field: 'priority', align: 'right' },
    { label: t('index_templates.index_templates_table.table.headers.components') }
  ])

  return {
    filteredItems,
    filterStateProps,
    columns
  }
}
