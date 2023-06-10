<template>
  <div class="flex justify-end q-pa-md">
    <div class="flex">
      <filter-input v-model="filter" />
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

<script setup lang="ts">
  import { toRefs } from 'vue'
  import CodeViewer from '../shared/CodeViewer.vue'
  import FilterInput from '../shared/FilterInput.vue'
  import ResizableContainer from '../shared/ResizableContainer.vue'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import { useIndexTemplatesTable } from '../../composables/components/indextemplates/IndexTemplatesTable'

  const props = defineProps<{ indexTemplates: IndexTemplate[] }>()

  const { indexTemplates } = toRefs(props)
  const { filter, filteredItems, columns } = useIndexTemplatesTable<IndexTemplate>({ indexTemplates })
</script>
