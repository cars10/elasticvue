<template>
  <div class="flex justify-between q-pa-sm q-ma-sm">
    <new-cluster />
    <filter-input v-model="filter" />
  </div>

  <q-table flat
           dense
           row-key="index"
           :columns="columns"
           :rows="clusters"
           :pagination="{sortBy: 'name'}"
           :filter="filter"
           :rows-per-page-options="DEFAULT_ROWS_PER_PAGE">
    <template #body="{row}">
      <tr class="clickable" @click="loadCluster(row.index)">
        <td>
          <div style="flex-shrink: 0" class="flex items-center">
            <svg class="q-mr-sm" height="14" width="14" style="margin-bottom: 6px">
              <circle :class="`health--${row.status}`" cx="7" cy="9" r="5" />
            </svg>

            <div>
              <div class="ellipsis" style="max-width: 300px;">
                {{ row.name }}
              </div>

              <div class="ellipsis" style="max-width: 300px;">
                <span class="font-13 text-muted">{{ row.clusterName }}</span>
              </div>
            </div>

            <q-chip v-if="row.index === connectionStore.activeClusterIndex"
                    class="q-mx-sm"
                    color="positive"
                    text-color="white"
                    dense>
              active
            </q-chip>
          </div>
        </td>
        <td>
          <div class="ellipsis" style="max-width: 300px;">
            {{ row.uri }}
            <copy-button :value="row.uri" round size="sm" flat />
          </div>
        </td>
        <td class="small-wrap">{{ row.version }}</td>
        <td class="small-wrap">
          <edit-cluster />
          <q-btn icon="delete" round flat size="sm" @click.stop="removeInstance(row.index)" />
        </td>
      </tr>
    </template>
  </q-table>
</template>

<script setup lang="ts">
  import CopyButton from '../shared/CopyButton.vue'
  import EditCluster from './EditCluster.vue'
  import FilterInput from '../shared/FilterInput.vue'
  import NewCluster from './NewCluster.vue'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import { useClusterTable } from '../../composables/components/clusterselection/ClusterTable'
  import { useConnectionStore } from '../../store/connection'

  const connectionStore = useConnectionStore()
  const { filter, clusters, removeInstance, loadCluster, columns } = useClusterTable()
</script>