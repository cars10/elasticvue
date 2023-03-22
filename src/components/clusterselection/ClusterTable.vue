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

            <div class="ellipsis" style="max-width: 300px;">
              {{ row.name }}
              <q-chip v-if="row.index === connectionStore.activeClusterIndex"
                      class="q-mx-sm"
                      color="positive"
                      text-color="white"
                      dense>
                active
              </q-chip>
            </div>
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

<script setup>
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import CopyButton from '../shared/CopyButton.vue'
  import EditCluster from './EditCluster.vue'
  import NewCluster from './NewCluster.vue'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import { useTranslation } from '../../composables/i18n'
  import { useConnectionStore } from '../../store/connection'
  import { reloadHomePage } from '../../helpers/router'
  import { askConfirm } from '../../helpers/dialogs'
  import FilterInput from '../shared/FilterInput.vue'

  const t = useTranslation()
  const connectionStore = useConnectionStore()
  const router = useRouter()

  const filter = ref('')
  const clusters = computed(() => {
    return [...connectionStore.clusters].map((cluster, i) => Object.assign({}, cluster, { index: i }))
  })

  const removeInstance = async index => {
    const cluster = connectionStore.clusters[index]
    const confirmed = await askConfirm(t('elasticsearch_instance.instances_table.row.remove_cluster.confirm',
        { name: cluster.name, uri: cluster.uri }))
    if (!confirmed) return

    connectionStore.removeCluster(index)
    if (index === connectionStore.activeClusterIndex) reloadHomePage(router, 0)
  }

  const loadCluster = index => (reloadHomePage(router, index))
  const columns = [
    {
      label: t('elasticsearch_instance.instances_table.headers.cluster'), field: 'name',
      name: 'name',
      align: 'left',
      sortable: true
    },
    { label: t('elasticsearch_instance.instances_table.headers.uri'), field: 'uri', align: 'left', },
    {
      label: t('elasticsearch_instance.instances_table.headers.version'),
      field: 'version',
      align: 'left',
    },
    { label: '' }
  ]
</script>