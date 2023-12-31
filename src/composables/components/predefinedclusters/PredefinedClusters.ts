import { genColumns } from '../../../helpers/tableColumns.ts'
import { useTranslation } from '../../i18n.ts'
import { ref } from 'vue'
import { useConnectionStore } from '../../../store/connection.ts'
import { newElasticsearchCluster } from '../../../helpers/newCluster.ts'

export type PredefinedCluster = {
  name?: string,
  username?: string,
  password?: string,
  uri: string
}

export const usePredefinedClusters = () => {
  const clusters = ref([])
  const selectedClusters = ref([])

  const dialog = ref(false)

  const loadPredefinedClusters = async () => {
    const response = await fetch('/api/default_clusters.json')
    if (response.status !== 200) return

    const contentType = response.headers.get('Content-Type')
    if (!contentType?.includes('application/json')) return

    const defaultClusters = await response.json()

    clusters.value = defaultClusters
        .filter((cluster: PredefinedCluster) => (cluster.uri && cluster.uri.length > 0))
        .map((cluster: PredefinedCluster) => (Object.assign({}, { name: '', username: '', password: '' }, cluster)))
    selectedClusters.value = clusters.value
  }
  loadPredefinedClusters()

  const t = useTranslation()
  const columns = genColumns([
    { label: t('setup.import_predefined_clusters.table.headers.health'), align: 'left' },
    { label: t('setup.import_predefined_clusters.table.headers.cluster_name'), field: 'name', align: 'left' },
    { label: t('setup.import_predefined_clusters.table.headers.uri'), field: 'uri', align: 'left' },
    { label: t('setup.import_predefined_clusters.table.headers.username'), field: 'username', align: 'left' },
    { label: t('setup.import_predefined_clusters.table.headers.password'), field: 'password', align: 'left' }
  ])

  const submit = () => {
    importClusters(selectedClusters.value)
    window.location.reload()
  }

  return {
    clusters,
    columns,
    dialog,
    selectedClusters,
    submit,
    loadPredefinedClusters
  }
}

const importClusters = (clusters: PredefinedCluster[]) => {
  if (clusters.length === 0) return

  const connectionStore = useConnectionStore()

  const missingClusters = clusters.filter(defaultCluster => {
    const alreadyExists = connectionStore.clusters.some(existingCluster => {
      if (compareClusters(existingCluster, defaultCluster)) {
        return true
      }
    })

    return !alreadyExists && defaultCluster.uri && defaultCluster.uri.length > 0
  })

  const emptyCluster = newElasticsearchCluster()
  missingClusters.forEach(missingCluster => {
    connectionStore.addCluster(Object.assign({}, emptyCluster, missingCluster))
  })
}

const compareClusters = (a: PredefinedCluster, b: PredefinedCluster) => (
    (!a.name || !b.name || a.name === b.name) &&
    (!a.uri || !b.uri || a.uri === b.uri) &&
    (!a.username || !b.username || a.username === b.username) &&
    (!a.password || !b.password || a.password === b.password)
)