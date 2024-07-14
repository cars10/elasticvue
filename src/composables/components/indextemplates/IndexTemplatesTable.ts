import { useTranslation } from '../../i18n'
import { computed } from 'vue'
import { genColumns } from '../../../helpers/tableColumns'
import { filterItems } from '../../../helpers/filters.ts'
import { GenericIndexTemplate } from './IndexTemplates.ts'
import { useIndexTemplatesStore } from '../../../store/index_templates.ts'
import { DEFAULT_HIDE_INDICES_REGEX } from '../../../consts.ts'

export type IndexTemplatesTableProps = {
  indexTemplates: GenericIndexTemplate[]
}

export const useIndexTemplatesTable = (props: IndexTemplatesTableProps) => {
  const t = useTranslation()
  const indexTemplatesStore = useIndexTemplatesStore()

  const filteredItems = computed(() => {
    let results = props.indexTemplates
    if (results.length === 0) return []

    if (!indexTemplatesStore.showHiddenIndices) {
      results = results.filter((item: any) => !item.name.match(new RegExp(DEFAULT_HIDE_INDICES_REGEX)))
    }
    return filterItems(results, indexTemplatesStore.filter, ['name', 'indexPatterns'])
  })

  const columns = genColumns([
    { label: '' },
    { label: t('index_templates.index_templates_table.table.headers.name'), field: 'name', },
    { label: t('index_templates.index_templates_table.table.headers.index_patterns') },
  ])

  return {
    filteredItems,
    columns
  }
}