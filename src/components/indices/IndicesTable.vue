<template>
  <div class="flex justify-between q-pa-md">
    <div>
      <new-index @reload="emit('reload')" />
      <router-link to="index_templates" class="q-ml-md">
        {{ t('index_templates.heading') }}
      </router-link>
    </div>

    <div class="flex">
      <filter-input v-model="filter" />

      <q-btn icon="settings" round flat class="q-ml-sm">
        <q-menu style="white-space: nowrap" anchor="bottom right" self="top end">
          <q-list dense>
            <q-item style="padding-left: 0">
              <q-checkbox v-model="indicesStore.showHiddenIndices" size="32px"
                          :label="t('indices.indices_table.show_hidden_indices.label')" />
            </q-item>

            <q-item style="padding-left: 0">
              <q-checkbox v-model="indicesStore.stickyTableHeader" size="32px"
                          :label="t('indices.indices_table.sticky_table_header.label')" />
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
  </div>

  <div :class="{'table--sticky-header': indicesStore.stickyTableHeader}">
    <resizable-container v-model="resizeStore.indicesTable" :active="indicesStore.stickyTableHeader">
      <q-table :key="tableKey"
               class="table-mono"
               flat
               dense
               row-key="index"
               :virtual-scroll="indicesStore.stickyTableHeader"
               :virtual-scroll-item-size="14"
               :columns="columns"
               :rows="items"
               :rows-per-page-options="rowsPerPage"
               :pagination="{sortBy: 'index'}"
               selection="multiple">
        <template #body="{row}">
          <index-row :index="row" @reload="emit('reload')">
            <template #checkbox>
              <q-checkbox v-model="selectedItems" :val="row.index" size="32px" @update:model-value="setIndeterminate" />
            </template>
          </index-row>
        </template>

        <template #header-selection>
          <q-checkbox v-model="allItemsSelected" size="32px" @update:model-value="checkAll" />
        </template>
      </q-table>
    </resizable-container>

    <div v-if="indices.length > 0" class="q-pa-md">
      <index-bulk :selected-indices="selectedItems"
                  :total-items-count="indices.length"
                  :filtered-items-count="items.length"
                  @reload="emit('reload')"
                  @indices-deleted="clearDeletedIndicesAndReload" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useTranslation } from '../../composables/i18n'
  import NewIndex from './NewIndex.vue'
  import IndexBulk from './IndexBulk.vue'
  import ResizableContainer from '../shared/ResizableContainer.vue'
  import IndexRow from './IndexRow.vue'
  import FilterInput from '../shared/FilterInput.vue'
  import { useIndicesTable } from '../../composables/components/indices/IndicesTable'
  import { toRefs } from 'vue'

  const t = useTranslation()

  const props = withDefaults(defineProps<{ indices: { index: string }[] }>(), { indices: () => ([]) })
  const { indices } = toRefs(props)
  const emit = defineEmits(['reload'])

  const {
    indicesStore,
    resizeStore,
    filter,
    items,
    tableKey,
    rowsPerPage,
    selectedItems,
    allItemsSelected,
    setIndeterminate,
    checkAll,
    clearDeletedIndicesAndReload,
    columns
  } = useIndicesTable({ indices, emit })
</script>
