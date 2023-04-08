import { useTranslation } from '../../i18n'
import { computed, Ref, ref } from 'vue'
import { filterItems } from '../../../helpers/filters'
import { genColumns } from '../../../helpers/tableColumns'

interface IndexTemplate {
  index_template: IndexTemplateSettings
}

interface IndexTemplateSettings {
  index_patterns: string[]
}

export const useIndexTemplatesTable = <T extends IndexTemplate> ({ indexTemplates }: { indexTemplates: Ref<T[]> }) => {
  const t = useTranslation()

  const filter = ref('')
  const enrichedIndexTemplates = computed(() => {
    return indexTemplates.value.map((i) => (Object.assign({}, i, { indexPatterns: i.index_template.index_patterns.join(' ') })))
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
    { label: t('index_templates.index_templates_table.table.headers.allow_auto_create'), },
    { label: t('index_templates.index_templates_table.table.headers.template') }
  ])

  return {
    filter,
    filteredItems,
    columns
  }
}