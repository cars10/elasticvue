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
           row-key="name"
           :columns="columns"
           :rows="filteredItems"
           :pagination="{sortBy: 'name'}"
           :rows-per-page-options="DEFAULT_ROWS_PER_PAGE">
    <template #body="body">
      <q-tr class="clickable" @click="body.expand = !body.expand">
        <q-td>
          <q-icon :name="body.expand ? 'expand_less' : 'expand_more'" />
        </q-td>
        <q-td>{{ body.row.name }}</q-td>
        <q-td>{{ body.row.index_template.index_patterns }}</q-td>
        <q-td>{{ body.row.index_template.priority }}</q-td>
        <q-td>{{ body.row.index_template.version }}</q-td>
        <q-td>{{ body.row.index_template.allow_auto_create }}</q-td>
        <q-td>{{ JSON.stringify(body.row.index_template.template) }}</q-td>
      </q-tr>

      <q-tr v-if="body.expand">
        <q-td colspan="100%">
          <div class="q-pa-md">
            <resizable-container>
              <code-viewer :value="JSON.stringify(body.row.index_template.template)" />
            </resizable-container>
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useTranslation } from '../../composables/i18n'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import { filterItems } from '../../helpers/filters'
  import CodeViewer from '../shared/CodeViewer.vue'
  import ResizableContainer from '../shared/ResizableContainer.vue'

  const t = useTranslation()

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
    { label: '' },
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
