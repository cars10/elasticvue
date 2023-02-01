<template>
  <div class="flex justify-end q-pa-md">
    <div class="flex">
      <q-input v-model="filter" :label="t('defaults.filter.label')" dense @keyup.esc="filter = ''">
        <template #append>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>
  </div>

  <q-table flat
           dense
           row-key="index"
           :columns="columns"
           :rows="filteredItems"
           :pagination="{sortBy: 'name'}"
           :rows-per-page-options="DEFAULT_ROWS_PER_PAGE">
    <template #body="{row}">
      <tr>
        <td>{{ row.name }}</td>
        <td>{{ row.index_template.index_patterns }}</td>
        <td>{{ row.index_template.priority }}</td>
        <td>{{ row.index_template.version }}</td>
        <td>{{ row.index_template.allow_auto_create }}</td>
        <td>{{ JSON.stringify(row.index_template.template) }}</td>
      </tr>
    </template>
  </q-table>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n/dist/vue-i18n.cjs'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import { filterItems } from '../../helpers/filters'

  const { t } = useI18n()

  const props = defineProps({
    indexTemplates: {
      default: () => ([]),
      type: Array
    }
  })

  const filter = ref('')
  const enrichedIndexTemplates = computed(() => {
    return props.indexTemplates.map(i => (Object.assign({}, i, { indexPatterns: i.index_template.index_patterns.join(' ') })))
  })
  const filteredItems = computed(() => {
    return filterItems(enrichedIndexTemplates.value, filter.value, ['name', 'indexPatterns'])
  })

  const columns = [
    {
      label: t('index_templates.index_templates_table.table.headers.name'), field: 'name',
      name: 'name',
      align: 'left',
      sortable: true,
    },
    {
      label: t('index_templates.index_templates_table.table.headers.index_patterns'),
      field: 'index_template.index_patterns',
      align: 'left',
      sortable: true,
    },
    {
      label: t('index_templates.index_templates_table.table.headers.priority'),
      field: 'index_template.priority',
      align: 'left',
      sortable: true,
    },
    {
      label: t('index_templates.index_templates_table.table.headers.version'),
      field: 'index_template.version',
      align: 'left',
      sortable: true,
    },
    {
      label: t('index_templates.index_templates_table.table.headers.allow_auto_create'),
      field: 'index_template.allow_auto_create', align: 'left',
      sortable: true,
    },
    {
      label: t('index_templates.index_templates_table.table.headers.template'),
      align: 'left',
      field: 'template'
    }
  ]
</script>
