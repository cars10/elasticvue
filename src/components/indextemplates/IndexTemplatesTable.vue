<template>
  <div class="flex justify-end q-pa-md">
    <div class="flex">
      <filter-input v-model="indexTemplatesStore.filter" />

      <q-btn icon="settings" round flat class="q-ml-sm">
        <q-menu style="white-space: nowrap" anchor="bottom right" self="top end">
          <q-list dense>
            <q-item style="padding-left: 0">
              <q-checkbox v-model="indexTemplatesStore.showHiddenIndices" size="32px"
                          :label="t('indices.indices_table.show_hidden_indices.label')" />
            </q-item>

            <q-item style="padding-left: 0">
              <q-checkbox v-model="indexTemplatesStore.stickyTableHeader" size="32px"
                          :label="t('indices.indices_table.sticky_table_header.label')" />
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
  </div>

  <div :class="{'table--sticky-header': indexTemplatesStore.stickyTableHeader, 'q-pb-md': true}">
    <resizable-container v-model="resizeStore.indexTemplatesTable" :active="indexTemplatesStore.stickyTableHeader">
      <q-table v-model:pagination="indexTemplatesStore.pagination"
               flat
               dense
               row-key="name"
               :columns="columns"
               :virtual-scroll="indexTemplatesStore.stickyTableHeader"
               :virtual-scroll-item-size="14"
               :rows="filteredItems"
               :rows-per-page-options="DEFAULT_ROWS_PER_PAGE">
        <template #body="{row}">
          <index-template-row :row="row" />
        </template>
      </q-table>
    </resizable-container>
  </div>
</template>

<script setup lang="ts">
  import FilterInput from '../shared/FilterInput.vue'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import {
    IndexTemplatesTableProps,
    useIndexTemplatesTable
  } from '../../composables/components/indextemplates/IndexTemplatesTable'
  import IndexTemplateRow from './IndexTemplateRow.vue'
  import { useIndexTemplatesStore } from '../../store/index_templates.ts'
  import { useTranslation } from '../../composables/i18n.ts'
  import ResizableContainer from '../shared/ResizableContainer.vue'
  import { useResizeStore } from '../../store/resize.ts'

  const props = defineProps<IndexTemplatesTableProps>()
  const indexTemplatesStore = useIndexTemplatesStore()
  const resizeStore = useResizeStore()

  const t = useTranslation()

  const { filteredItems, columns } = useIndexTemplatesTable(props)
</script>
