<template>
  <div class="flex justify-between q-pa-md">
    <div class="flex items-center">
      <q-btn v-if="Object.keys(currentReroutingShard).length > 0"
             :label="t('shards.shards_table.cancel_relocation')"
             color="primary-dark"
             class="q-mr-md"
             @click="cancelRelocation" />

      <router-link to="shards/recovery">
        {{ t('shard_recovery.heading') }}
      </router-link>

      <filter-state v-model="shardsStore.filter"
                    :results-count="filterStateProps.resultsCount"
                    :filtered-results-count="filterStateProps.filteredResultsCount"
                    class="q-ml-md" />
    </div>

    <div class="flex">
      <slot />

      <filter-input v-model="shardsStore.filter" :columns="['index']" />

      <q-btn icon="settings" round flat class="q-ml-sm">
        <q-menu style="white-space: nowrap" anchor="bottom right" self="top end">
          <q-list dense>
            <q-item style="padding-left: 0">
              <q-checkbox v-model="indicesStore.showHiddenIndices" size="32px"
                          :label="t('indices.indices_table.show_hidden_indices.label')" />
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
  </div>

  <q-table v-model:pagination="pagination"
           class="table-mono table-hide-overflow"
           flat
           dense
           :columns="columns"
           binary-state-sort
           :rows="shards?.nodes || []"
           :rows-per-page-options="DEFAULT_ROWS_PER_PAGE"
           separator="cell"
           @request="updateTable">
    <template #header="{cols}">
      <tr>
        <q-th class="small-wrap text-left">Node</q-th>
        <q-th v-for="(col, i) in cols" :key="`${col.name}_header_${i}`"
              class="text-left"
              :class="{marked: markedColumnIndex === i}"
              @mouseover="markColumn(i)"
              @mouseleave="unmarkColumn">
          <div>
            <svg height="14" width="14" class="q-mr-xs">
              <circle :class="`health--${shards.indices[col.name].health}`" cx="7" cy="9" r="5" />
            </svg>
            <span :class="{'text-underline': currentReroutingShard.index === col.name}">{{ col.label }}</span>
          </div>
          <small class="text-weight-regular"
                 :title="`${shards.indices[col.name].pri} pri / ${shards.indices[col.name].rep} rep`">
            {{ shards.indices[col.name].pri }}/{{ shards.indices[col.name].rep }} shards
          </small>
        </q-th>
      </tr>
    </template>
    <template #top-row="{cols}">
      <tr v-if="shards?.nodes?.length > 0">
        <td class="small-wrap">
          <i>unassigned</i>
        </td>
        <td v-for="(col, i) in cols" :key="`${col.name}_unassigned_${i}`"
            :class="{marked: markedColumnIndex === i}"
            @mouseover="markColumn(i)"
            @mouseleave="unmarkColumn">
          <div class="flex">
            <index-shard v-for="(shard, j) in shards.unassignedShards[col.name]"
                         :key="`${col.name}_unassigned_${i}_${j}_shards`" :shard="shard" />
          </div>
        </td>
      </tr>
    </template>
    <template #body="{row, cols}">
      <tr>
        <td>{{ row }}</td>
        <td v-for="(col, i) in cols"
            :key="`${col.name}_shards_${i}`"
            :class="{marked: markedColumnIndex === i}"
            @mouseover="markColumn(i)"
            @mouseleave="unmarkColumn">
          <div class="flex items-center">
            <q-btn v-if="currentReroutingShard.index === col.name && currentReroutingShard.node !== row"
                   class="q-mx-xs q-my-xs"
                   color="primary-dark"
                   icon="check"
                   no-caps
                   @click="reroute(currentReroutingShard, row)" />

            <index-shard v-for="(shard, j) in shards.shards?.[row]?.[col.name]"
                         :key="`${col.name}_actual_shard_${i}_${j}`"
                         :shard="shard"
                         :action="initReroute"
                         re-routable
                         :outlined="!(currentReroutingShard.index === col.name && currentReroutingShard.node === row && currentReroutingShard.shard === shard.shard)" />
          </div>
        </td>
      </tr>
    </template>
  </q-table>
</template>

<script setup lang="ts">
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import IndexShard from './IndexShard.vue'
  import FilterInput from '../shared/FilterInput.vue'
  import { useTranslation } from '../../composables/i18n'
  import { ShardsTableProps, useShardsTable } from '../../composables/components/shards/ShardsTable.ts'
  import FilterState from '../shared/FilterState.vue'

  const t = useTranslation()
  const props = defineProps<ShardsTableProps>()
  const emit = defineEmits(['reload'])

  const {
    shardsStore,
    filterStateProps,
    indicesStore,
    pagination,
    columns,
    updateTable,
    markedColumnIndex,
    markColumn,
    unmarkColumn,
    currentReroutingShard,
    cancelRelocation,
    initReroute,
    reroute
  } = useShardsTable(props, emit)
</script>
