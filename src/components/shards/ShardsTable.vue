<template>
  <div class="flex justify-end q-pa-md">
    <filter-input v-model="filter" />

    <q-btn icon="settings" round flat>
      <q-menu style="white-space: nowrap" anchor="bottom right" self="top end">
        <q-list dense>
          <q-item style="padding-left: 0">
            <q-checkbox v-model="indicesStore.showHiddenIndices" size="32px"
                        :label="$t('indices.indices_table.show_hidden_indices.label')" />
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
  </div>

  <q-table v-model:pagination="pagination"
           class="table-mono"
           flat
           dense
           :columns="columns"
           binary-state-sort
           :rows="shards?.nodes || []"
           :rows-per-page-options="DEFAULT_ROWS_PER_PAGE"
           separator="cell"
           @request="updateTable">
    <template #header="{cols}">
      <q-tr>
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
          <small class="text-weight-regular">
            {{ shards.indices[col.name].pri }}/{{ shards.indices[col.name].rep }} shards
          </small>
        </q-th>
      </q-tr>
    </template>
    <template #top-row="{cols}">
      <q-tr>
        <q-td class="small-wrap">
          <i>unassigned</i>
        </q-td>
        <q-td v-for="(col, i) in cols" :key="`${col.name}_unassigned_${i}`"
              :class="{marked: markedColumnIndex === i}"
              @mouseover="markColumn(i)"
              @mouseleave="unmarkColumn">
          <index-shard v-for="(shard, j) in shards.unassignedShards[col.name]"
                       :key="`${col.name}_unassigned_${i}_${j}_shards`" :shard="shard" />
        </q-td>
      </q-tr>
    </template>
    <template #body="{row, cols}">
      <q-tr>
        <q-td>{{ row }}</q-td>
        <q-td v-for="(col, i) in cols"
              :key="`${col.name}_shards_${i}`"
              :class="{marked: markedColumnIndex === i}"
              @mouseover="markColumn(i)"
              @mouseleave="unmarkColumn">
          <index-shard v-for="(shard, j) in shards.shards?.[row]?.[col.name]"
                       :key="`${col.name}_actual_shard_${i}_${j}`"
                       :shard="shard"
                       :action="initReroute"
                       re-routable
                       :outlined="!(currentReroutingShard.index === col.name && currentReroutingShard.node === row && currentReroutingShard.shard === shard.shard)" />

          <div v-if="currentReroutingShard.index === col.name && currentReroutingShard.node !== row">
            <button class="shard-reroute-target" @click="reroute(currentReroutingShard, row)" />
          </div>
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script setup>
  import { computed, ref, watch } from 'vue'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import { useElasticsearchAdapter } from '../../composables/CallElasticsearch'
  import { useSnackbar } from '../../composables/Snackbar'
  import { useTableColumnHover } from '../../composables/TableColumnHover'
  import { useIndicesStore } from '../../store/indices'
  import IndexShard from './IndexShard.vue'
  import FilterInput from '../shared/FilterInput.vue'

  const props = defineProps({
    shards: {
      type: Object,
      default: () => ({})
    }
  })
  const emit = defineEmits(['reload'])

  const indicesStore = useIndicesStore()

  const filter = ref('')
  const { markedColumnIndex, markColumn, unmarkColumn } = useTableColumnHover()

  const filteredShards = computed(() => {
    const shards = Object.assign({}, props.shards)
    if (Object.keys(shards).length === 0) return shards

    if (!indicesStore.showHiddenIndices) {
      Object.assign(shards, { indexNames: shards.indexNames.filter(item => !item.match(new RegExp(indicesStore.hideIndicesRegex))) })
    }

    if (filter.value.length !== 0) {
      const query = filter.value.slice().toLowerCase().trim()
      Object.assign(shards, { indexNames: shards.indexNames.filter(item => item.includes(query)) })
    }

    return shards
  })

  const columns = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.rowsPerPage
    const end = start + pagination.value.rowsPerPage
    const slice = filteredShards.value?.indexNames?.slice(start, end) || []
    return slice.map(val => ({ label: val, name: val }))
  })

  const rowsNumber = ref(0)
  watch(filteredShards, newValue => {
    pagination.value.rowsNumber = newValue?.indexNames?.length || 0
  })

  const pagination = ref({
    sortBy: 'desc',
    descending: false,
    page: 1,
    rowsPerPage: 10,
    rowsNumber
  })

  const updateTable = requestProps => {
    const { page, rowsPerPage, sortBy, descending } = requestProps.pagination

    pagination.value.page = page
    pagination.value.rowsPerPage = rowsPerPage
    pagination.value.sortBy = sortBy
    pagination.value.descending = descending
  }

  const currentReroutingShard = ref({})
  const initReroute = shard => {
    if (currentReroutingShard.value.node === shard.node &&
      currentReroutingShard.value.index === shard.index &&
      currentReroutingShard.value.shard === shard.shard) {
      currentReroutingShard.value = {}
    } else {
      currentReroutingShard.value = shard
    }
  }

  const { showSnackbar } = useSnackbar()
  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const reroute = (shardToReroute, targetNode) => {
    const commands = [
      {
        move: {
          index: shardToReroute.index,
          shard: shardToReroute.shard,
          from_node: shardToReroute.node,
          to_node: targetNode
        }
      }]

    callElasticsearch('clusterReroute', commands).then(() => {
      currentReroutingShard.value = {}
      emit('reload')
    }).catch(() => {
      showSnackbar(requestState.value)
    })
  }
</script>

<style scoped>
.shard-reroute-target {
    background-color: transparent;
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 2px dashed grey;
}

.shard-reroute-target:hover {
    background-color: rgba(150, 150, 150, 0.5);
    cursor: pointer;
}
</style>
