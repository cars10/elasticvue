import { useTranslation } from '../../i18n'
import { computed, ref } from 'vue'
import { genColumns } from '../../../helpers/tableColumns'
import { filterItems } from '../../../helpers/filters.ts'

export type EsIndexTemplate = {
  name: string,
  index_patterns: string[],
  order: string,
  version: string,
}

export type EsIndexTemplates = Record<string, EsIndexTemplate>

export type IndexTemplatesTableProps = {
  indexTemplates: EsIndexTemplates
}

export const useIndexTemplatesTable = (props: IndexTemplatesTableProps) => {
  const t = useTranslation()

  const filter = ref('')
  const enrichedIndexTemplates = computed(() => {
    return Object.entries(props.indexTemplates).map(([name, template]) => {
      return Object.assign({}, { name }, { indexPatterns: template.index_patterns?.join('') }, template)
    })
  })

  const filteredItems = computed(() => {
    return filterItems(enrichedIndexTemplates.value, filter.value, ['name', 'indexPatterns'])
  })

  const columns = genColumns([
    { label: '' },
    { label: t('index_templates.index_templates_table.table.headers.name'), field: 'name', },
    { label: t('index_templates.index_templates_table.table.headers.index_patterns') },
    { label: t('index_templates.index_templates_table.table.headers.priority') },
    { label: t('index_templates.index_templates_table.table.headers.version') },
  ])

  return {
    filter,
    filteredItems,
    columns
  }
}