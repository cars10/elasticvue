<template>
  <div class="flex justify-between q-pa-md">
    <filter-state v-model="shardRecoveryStore.filter"
                  :results-count="filterStateProps.resultsCount"
                  :filtered-results-count="filterStateProps.filteredResultsCount" />

    <div class="flex q-ml-auto">
      <q-select v-model="stage"
                :options="['INIT', 'INDEX', 'VERIFY_INDEX', 'TRANSLOG', 'FINALIZE', 'DONE']"
                :label="t('shard_recovery_table.stage')"
                clearable
                dense
                outlined
                class="q-mr-md"
                style="min-width: 140px" />
      <filter-input v-model="shardRecoveryStore.filter" :columns="['index']" />

      <q-btn icon="settings" round flat class="q-ml-sm">
        <q-menu style="white-space: nowrap" anchor="bottom right" self="top end">
          <q-list dense>
            <q-item style="padding-left: 0">
              <q-checkbox v-model="shardRecoveryStore.stickyTableHeader" size="32px"
                          :label="t('index_templates.index_templates_table.sticky_table_header.label')" />
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
  </div>

  <div :class="{'table--sticky-header': shardRecoveryStore.stickyTableHeader, 'q-pb-md': true}">
    <resizable-container v-model="resizeStore.shardRecoveryTable" :active="shardRecoveryStore.stickyTableHeader">
      <q-table v-model:pagination="shardRecoveryStore.pagination"
               flat
               dense
               row-key="name"
               :columns="columns"
               :virtual-scroll="shardRecoveryStore.stickyTableHeader"
               :virtual-scroll-item-size="14"
               :rows="filteredResults"
               :rows-per-page-options="DEFAULT_ROWS_PER_PAGE">
        <template #body="{row}">
          <shard-recovery-row :shard-recovery="row" />
        </template>
      </q-table>
    </resizable-container>
  </div>
</template>

<script setup lang="ts">
  import FilterState from '../shared/FilterState.vue'
  import FilterInput from '../shared/FilterInput.vue'
  import { useTranslation } from '../../composables/i18n.ts'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts.ts'
  import ResizableContainer from '../shared/ResizableContainer.vue'
  import { useResizeStore } from '../../store/resize.ts'
  import ShardRecoveryRow from './ShardRecoveryRow.vue'
  import {
    ShardRecoveryTableProps,
    useShardRecoveryTable
  } from '../../composables/components/shardrecovery/ShardRecoveryTable.ts'
  import { useShardRecoveryStore } from '../../store/shardRecovery.ts'

  const t = useTranslation()

  const props = defineProps<ShardRecoveryTableProps>()
  const shardRecoveryStore = useShardRecoveryStore()
  const resizeStore = useResizeStore()

  const { filterStateProps, filteredResults, columns, stage } = useShardRecoveryTable(props)
</script>