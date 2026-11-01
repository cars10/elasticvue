<template>
  <div class="flex justify-between q-pa-md">
    <div class="flex items-center">
      <q-btn
        v-if="Object.keys(currentReroutingShard).length > 0"
        :label="t('shards.shards_table.cancel_relocation')"
        color="primary-dark"
        class="q-mr-md"
        @click="cancelRelocation"
      />

      <filter-state
        v-model="shardsStore.filter"
        :results-count="filterStateProps.resultsCount"
        :filtered-results-count="filterStateProps.filteredResultsCount"
      />
    </div>

    <div class="flex">
      <q-toggle
        v-model="shardsStore.rows"
        true-value="nodes"
        false-value="indices"
        :label="t('shards.shards_table.rows.nodes')"
        class="q-mr-md"
        data-testid="shards-rows"
      />

      <slot />

      <filter-input v-model="shardsStore.filter" :columns="['index']" />

      <q-btn icon="settings" round flat class="q-ml-sm">
        <q-menu style="white-space: nowrap" anchor="bottom right" self="top end">
          <q-list dense>
            <q-item style="padding-left: 0">
              <q-checkbox
                v-model="indicesStore.showHiddenIndices"
                size="32px"
                :label="t('indices.indices_table.show_hidden_indices.label')"
              />
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
  </div>

  <q-table
    v-model:pagination="pagination"
    class="table-mono table-hide-overflow"
    data-testid="shards-table"
    flat
    dense
    :columns="columns"
    binary-state-sort
    :rows="rows"
    :rows-per-page-options="DEFAULT_ROWS_PER_PAGE"
    separator="cell"
    @request="updateTable"
  >
    <template #header="{ cols }">
      <tr>
        <q-th class="small-wrap text-left">
          {{ indicesAsRows ? t('shards.shards_table.index') : t('shards.shards_table.node') }}
        </q-th>
        <q-th v-if="indicesAsRows" class="small-wrap text-left">
          <i>{{ t('shards.shards_table.unassigned') }}</i>
        </q-th>
        <q-th
          v-for="(col, i) in cols"
          :key="`${col.name}_header`"
          class="text-left"
          :class="{ marked: markedColumnIndex === i }"
          @mouseover="markColumn(i as number)"
          @mouseleave="unmarkColumn"
        >
          <shards-label v-bind="labelFor(col.name, !indicesAsRows)" />
        </q-th>
      </tr>
    </template>
    <template #top-row="{ cols }">
      <tr v-if="!indicesAsRows && rows.length > 0">
        <td class="small-wrap">
          <i>{{ t('shards.shards_table.unassigned') }}</i>
        </td>
        <td
          v-for="(col, i) in cols"
          :key="`${col.name}_unassigned`"
          :class="{ marked: markedColumnIndex === i }"
          @mouseover="markColumn(i as number)"
          @mouseleave="unmarkColumn"
        >
          <shards-cell :index="col.name" :shards="shards.unassignedShards[col.name]" :rerouting-shard="currentReroutingShard" />
        </td>
      </tr>
    </template>
    <template #body="{ row, cols }">
      <tr>
        <td>
          <shards-label v-bind="labelFor(row, indicesAsRows)" />
        </td>
        <td v-if="indicesAsRows">
          <shards-cell :index="row" :shards="shards.unassignedShards[row]" :rerouting-shard="currentReroutingShard" />
        </td>
        <td
          v-for="(col, i) in cols"
          :key="`${col.name}_shards`"
          :class="{ marked: markedColumnIndex === i }"
          @mouseover="markColumn(i as number)"
          @mouseleave="unmarkColumn"
        >
          <shards-cell
            v-bind="cellFor(row, col.name)"
            :rerouting-shard="currentReroutingShard"
            @select="initReroute"
            @reroute="reroute"
          />
        </td>
      </tr>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
import ShardsCell from './ShardsCell.vue'
import ShardsLabel from './ShardsLabel.vue'
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
  indicesAsRows,
  rows,
  columns,
  updateTable,
  markedColumnIndex,
  markColumn,
  unmarkColumn,
  currentReroutingShard,
  cancelRelocation,
  initReroute,
  reroute,
  labelFor,
  cellFor
} = useShardsTable(props, emit)
</script>
