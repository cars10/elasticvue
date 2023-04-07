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
    return [...connectionStore.clusters].map((cluster, i) => Object.assign({}, cluster, { index: i }))
  })

  const removeInstance = async (index: number) => {
    const cluster = connectionStore.clusters[index]
    const confirmed = await askConfirm(t('elasticsearch_instance.instances_table.row.remove_cluster.confirm',
        { name: cluster.name, uri: cluster.uri }))
    if (!confirmed) return

    connectionStore.removeCluster(index)
    if (index === connectionStore.activeClusterIndex) reloadHomePage(router, 0)
  }

  const loadCluster = (index: number) => (reloadHomePage(router, index))
  const columns = genColumns([
    { label: t('elasticsearch_instance.instances_table.headers.cluster'), field: 'name', sortable: true },
    { label: t('elasticsearch_instance.instances_table.headers.uri'), field: 'uri' },
    { label: t('elasticsearch_instance.instances_table.headers.version'), field: 'version' },
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