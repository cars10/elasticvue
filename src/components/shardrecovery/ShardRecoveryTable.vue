<template>
  <div class="flex justify-end q-pa-md">
    <div class="flex">
      <slot />

      <filter-input v-model="shardRecoveryStore.filter" />

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
               :rows="filteredItems"
               :rows-per-page-options="DEFAULT_ROWS_PER_PAGE">
        <template #body="{row}">
          <shard-recovery-row :shard-recovery="row" />
        </template>
      </q-table>
    </resizable-container>
  </div>
</template>

<script setup lang="ts">
  import FilterInput from '../shared/FilterInput.vue'
  import { useShardRecoveryState } from '../../store/shardRecovery.ts'
  import { useTranslation } from '../../composables/i18n.ts'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts.ts'
  import ResizableContainer from '../shared/ResizableContainer.vue'
  import { useResizeStore } from '../../store/resize.ts'
  import { genColumns } from '../../helpers/tableColumns.ts'
  import { computed } from 'vue'
  import ShardRecoveryRow from './ShardRecoveryRow.vue'

  export type ShardRecovery = {
    index: string
    shard: string
    time: string
    type: string
    stage: string
    source_host: string
    source_node: string
    target_host: string
    target_node: string
    files_recovered: string
    files_percent: string
    files_total: string
    bytes_recovered: string
    bytes_percent: string
    bytes_total: string
    translog_ops: string
    translog_ops_recovered: string
    translog_ops_percent: string
  }

  const t = useTranslation()

  type ShardRecoveryTableProps = {
    shardRecoveries: ShardRecovery[]
  }
  const props = defineProps<ShardRecoveryTableProps>()
  const shardRecoveryStore = useShardRecoveryState()
  const resizeStore = useResizeStore()
  const filteredItems = computed(() => (props.shardRecoveries))


  const columns = genColumns([
    { label: t('shard_recovery_table.columns.index'), field: 'index' },
    { label: t('shard_recovery_table.columns.stage'), field: 'stage' },
    { label: t('shard_recovery_table.columns.source_target') },
    { label: t('shard_recovery_table.columns.time') },
    { label: t('shard_recovery_table.columns.files') },
    { label: t('shard_recovery_table.columns.bytes') },
    { label: t('shard_recovery_table.columns.translog_ops') },
  ])
</script>