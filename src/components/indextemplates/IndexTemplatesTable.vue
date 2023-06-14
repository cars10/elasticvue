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
      <tr class="clickable" @click="body.expand = !body.expand">
        <td>
          <q-icon :name="body.expand ? 'expand_less' : 'expand_more'" />
        </td>
        <td>{{ body.row.name }}</td>
        <td>{{ body.row.index_template.index_patterns }}</td>
        <td>{{ body.row.index_template.priority }}</td>
        <td>{{ body.row.index_template.version }}</td>
        <td>{{ body.row.index_template.allow_auto_create }}</td>
        <td>{{ JSON.stringify(body.row.index_template.template) }}</td>
      </tr>

      <tr v-if="body.expand">
        <td colspan="100%">
          <div class="q-pa-md">
            <resizable-container>
              <code-viewer :value="JSON.stringify(body.row.index_template.template)" />
            </resizable-container>
          </div>
        </td>
      </tr>
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
