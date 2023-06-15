import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTranslation } from '../../i18n'
import { useConnectionStore } from '../../../store/connection'
import { askConfirm } from '../../../helpers/dialogs'
import { reloadHomePage } from '../../../helpers/router'
import { genColumns } from '../../../helpers/tableColumns'

export const useClusterTable = () => {
  const t = useTranslation()
  const connectionStore = useConnectionStore()
  const router = useRouter()

  const filter = ref('')
  const clusters = computed(() => {
    const search = filter.value.toLowerCase().trim()

    return [...connectionStore.clusters]
        .filter((cluster) => {
          return cluster.name.toLowerCase().includes(search) ||
              cluster.uri.toLowerCase().includes(search) ||
              cluster.clusterName.toLowerCase().includes(search)
        })
        .map((cluster, i) => Object.assign({}, cluster, { index: i }))
  })

  const removeInstance = async (index: number) => {
    const cluster = connectionStore.clusters[index]
    const confirmed = await askConfirm(t('cluster_selection.cluster_table.row.remove_cluster.confirm',
        { name: cluster.name, uri: cluster.uri }))
    if (!confirmed) return

    connectionStore.removeCluster(index)
    if (index === connectionStore.activeClusterIndex) reloadHomePage(router, 0)
  }

  const loadCluster = (index: number) => (reloadHomePage(router, index))
  const columns = genColumns([
    { label: t('cluster_selection.cluster_table.headers.cluster'), field: 'name' },
    { label: t('cluster_selection.cluster_table.headers.uri') },
    { label: t('cluster_selection.cluster_table.headers.version'), field: 'version' },
    { label: '' }
  ])

  return {
    filter,
    clusters,
    removeInstance,
    loadCluster,
    columns
  }
}