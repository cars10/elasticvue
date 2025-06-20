<template>
  <div class="flex justify-between q-pa-sm q-ma-sm">
    <new-cluster />
    <filter-input v-model="filter" data-testid="cluster-table-filter" />
  </div>

  <q-table flat
           dense
           row-key="index"
           data-testid="cluster-table"
           :columns="columns"
           :rows="clusters"
           :pagination="{sortBy: 'name'}"
           :rows-per-page-options="DEFAULT_ROWS_PER_PAGE">
    <template #body="{row}: {row: ElasticsearchCluster & {index: number}}">
      <tr class="clickable" :data-testid="`cluster-table-row-${row.index}`" @click="loadCluster(row.index)">
        <td :title="t('cluster_selection.cluster_table.row.title', {uri: row.uri})">
          <div style="flex-shrink: 0" class="flex items-center">
            <cluster-status-indicator :status="row.status" />

            <div>
              <div class="ellipsis" style="max-width: 300px;">
                {{ row.name }}
              </div>

              <div class="ellipsis font-13 text-muted" style="max-width: 300px;">
                {{ row.clusterName }}
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
        <td :title="t('cluster_selection.cluster_table.row.title', {uri: row.uri})">
          <div class="ellipsis inline-block vertical-middle q-mr-sm" style="max-width: 300px;">
            {{ row.uri }}
          </div>
          <copy-button :value="row.uri" round size="sm" flat />
        </td>
        <td class="small-wrap">
          <div class="flex items-center no-wrap">
            {{ row.version }}
            <q-chip v-if="row.flavor === BuildFlavor.serverless" class="q-mx-sm"
                    color="purple-7"
                    text-color="white"
                    dense>
              serverless
            </q-chip>
            <unsupported-version v-if="row.majorVersion && row.distribution === DISTRIBUTIONS.elasticsearch"
                                 :major-version="row.majorVersion" />
          </div>
        </td>
        <td class="small-wrap">
          <div v-if="row.predefined">
            <q-btn icon="edit" disabled round flat size="sm" />
            <q-btn icon="delete" disabled round flat size="sm" />
            <q-tooltip>
              <div class="flex items-center" style="gap: 4px">
                <q-icon name="warning" />
                This cluster was setup by your administrator. You cannot change it directly.
              </div>
            </q-tooltip>
          </div>
          <div v-else>
            <edit-cluster :index="row.index" />
            <q-btn icon="delete" round flat size="sm" data-testid="cluster-delete"
                   :title="t('defaults.delete')" @click.stop="removeInstance(row.index)" />
          </div>
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
  import { DEFAULT_ROWS_PER_PAGE, DISTRIBUTIONS } from '../../consts'
  import { useClusterTable } from '../../composables/components/clusterselection/ClusterTable'
  import { BuildFlavor, ElasticsearchCluster, useConnectionStore } from '../../store/connection'
  import { useTranslation } from '../../composables/i18n.ts'
  import ClusterStatusIndicator from './ClusterStatusIndicator.vue'
  import UnsupportedVersion from './UnsupportedVersion.vue'

  const t = useTranslation()
  const connectionStore = useConnectionStore()
  const { filter, clusters, removeInstance, loadCluster, columns } = useClusterTable()
</script>