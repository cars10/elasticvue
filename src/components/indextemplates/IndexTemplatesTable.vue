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
    <template #body="{row}">
      <index-template-row :row="row" />
    </template>
  </q-table>
</template>

<script setup lang="ts">
  import FilterInput from '../shared/FilterInput.vue'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import {
    IndexTemplatesTableProps,
    useIndexTemplatesTable
  } from '../../composables/components/indextemplates/IndexTemplatesTable'
  import IndexTemplateRow from './IndexTemplateRow.vue'

  const props = defineProps<IndexTemplatesTableProps>()
  const { filter, filteredItems, columns } = useIndexTemplatesTable(props)
</script>
