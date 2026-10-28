import { onMounted, ref } from 'vue'
import ElasticsearchAdapter from '../../../services/ElasticsearchAdapter.ts'
import { ElasticsearchCluster, useConnectionStore } from '../../../store/connection.ts'
import { checkHealth } from '../home/ClusterHealth.ts'
import { CLUSTER_STATS_PARAMS, parseNodesFromStats } from '../../../helpers/homeDashboard.ts'
import { peakMetric } from '../../../helpers/nodeStats.ts'
import type { ClusterHealth, ClusterStats } from '../../../types/homeDashboard.ts'

const NODES_STATS = {
  metrics: 'jvm,fs,os,process',
  params: {
    filter_path: [
      'jvm.mem.heap_used_percent',
      'jvm.mem.heap_used_in_bytes',
      'jvm.mem.heap_max_in_bytes',
      'fs.total.total_in_bytes',
      'fs.total.available_in_bytes',
      'fs.total.free_in_bytes',
      'os.cpu.percent',
      'process.cpu.percent'
    ]
      .map((field) => `nodes.*.${field}`)
      .join(',')
  }
}

export type ClusterSummary = {
  stats: ClusterStats | null
  cpu: number | null
  heap: number | null
  disk: number | null
  shards: number | null
  nodesAvailable: boolean
}

const json = (request: Promise<unknown>) => request.then((response: any) => response.json()).catch(() => null)

const shardsPercent = (health: ClusterHealth | null) => {
  if (!health) return null
  if (health.active_shards_percent_as_number != null) return health.active_shards_percent_as_number
  const total = health.active_shards + health.unassigned_shards
  return total > 0 ? (health.active_shards / total) * 100 : null
}

export const useClustersOverview = () => {
  const connectionStore = useConnectionStore()
  const overviews = ref<(ClusterSummary | undefined)[]>([])

  const load = async (cluster: ElasticsearchCluster, index: number) => {
    const adapter = new ElasticsearchAdapter(cluster)
    const [health, stats, nodesBody] = await Promise.all([
      checkHealth(cluster),
      json(adapter.clusterStats(CLUSTER_STATS_PARAMS)),
      json(adapter.nodesStats(NODES_STATS.metrics, NODES_STATS.params))
    ])

    const nodes = parseNodesFromStats(nodesBody)
    overviews.value[index] = {
      stats,
      cpu: peakMetric(nodes, 'cpuPercent').value,
      heap: peakMetric(nodes, 'heapPercent').value,
      disk: peakMetric(nodes, 'diskPercent').value,
      shards: shardsPercent(health),
      nodesAvailable: nodesBody != null
    }
  }

  let refreshing = false
  const refresh = async () => {
    if (refreshing) return
    refreshing = true
    try {
      await Promise.all(connectionStore.clusters.map(load))
    } finally {
      refreshing = false
    }
  }

  onMounted(refresh)

  return { overviews, refresh }
}
