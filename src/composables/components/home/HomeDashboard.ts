import { computed, onMounted, ref, shallowRef } from 'vue'
import { useElasticsearchAdapter } from '../../CallElasticsearch'
import { useConnectionStore } from '../../../store/connection.ts'
import { useTranslation } from '../../i18n.ts'
import { DISTRIBUTIONS } from '../../../consts.ts'
import {
  aggregateCounters,
  CLUSTER_STATS_PARAMS,
  EMPTY_WORKLOAD,
  HOME_NODES_STATS,
  HOME_INDEX_PARAMS,
  nextWorkloadRates,
  parseCatIndices,
  parseNodesFromStats,
  topNodesByPressure
} from '../../../helpers/homeDashboard.ts'
import {
  CLUSTER_SETTINGS_PARAMS,
  DEFAULT_DISK_WATERMARKS,
  parseDiskWatermarks,
  parseElectedMasterNodeId,
  peakMetric
} from '../../../helpers/nodeStats.ts'
import {
  buildAttentionChecks,
  parseAllocationEnable,
  parseIndexBlocks,
  parsePendingTasks,
  PENDING_TASKS_FETCH_THRESHOLD,
  trimHeapSamples,
  trimPressureSamples
} from '../../../helpers/homeAttention.ts'
import type {
  AllocationEnable,
  CatIndexRow,
  ClusterHealth,
  ClusterStats,
  CounterSample,
  DiskWatermarks,
  HeapSample,
  IndexBlock,
  NodesStatsBody,
  OverviewIndex,
  OverviewNode,
  PendingTaskInfo,
  PressureSample,
  WorkloadRates
} from '../../../types/homeDashboard.ts'

export const useHomeDashboard = () => {
  const t = useTranslation()
  const connectionStore = useConnectionStore()
  const { callElasticsearch } = useElasticsearchAdapter()

  // API responses are always replaced as a whole, so shallow refs are enough and avoid deep proxies
  const stats = shallowRef<ClusterStats | null>(null)
  const health = shallowRef<ClusterHealth | null>(null)
  const nodes = shallowRef<OverviewNode[]>([])
  const nodesMonitoringAvailable = ref<boolean | null>(null)
  const pendingTasks = shallowRef<PendingTaskInfo | null>(null)

  const attentionIndices = shallowRef<OverviewIndex[]>([])
  const attentionIndicesTotal = ref(0)
  const unhealthyIndices = shallowRef<{ red: string[]; yellow: string[] }>({ red: [], yellow: [] })
  const indexBlocks = shallowRef<IndexBlock[]>([])
  const diskWatermarks = shallowRef<DiskWatermarks>({ ...DEFAULT_DISK_WATERMARKS })
  const allocationEnable = ref<AllocationEnable>('all')

  // Samples collected across reloads, used for rates and sustained-pressure checks
  const workload = shallowRef<WorkloadRates>({ ...EMPTY_WORKLOAD })
  const pressureSamples = shallowRef<PressureSample[]>([])
  const heapSamples = shallowRef<HeapSample[]>([])
  let lastCounterSample: CounterSample | null = null

  const clusterStatus = computed(() => (health.value?.status || stats.value?.status || '').toLowerCase())

  const versionLabel = computed(() => {
    const cluster = connectionStore.activeCluster
    const versions = stats.value?.nodes.versions
    const version = versions?.length === 1 ? versions[0] : cluster?.version
    if (!version) return null

    const product = cluster?.distribution === DISTRIBUTIONS.opensearch ? 'OpenSearch' : 'Elasticsearch'
    return `${product} ${version}`
  })

  const maxCpu = computed(() => peakMetric(nodes.value, 'cpuPercent'))
  const maxDisk = computed(() => peakMetric(nodes.value, 'diskPercent'))
  const maxHeap = computed(() =>
    peakMetric(nodes.value, 'heapPercent', (node) =>
      node.heapCurrent && node.heapMax ? `${node.heapCurrent} / ${node.heapMax}` : null
    )
  )

  /** Table preview only — full `nodes` still feeds charts, attention, and workload. */
  const topNodes = computed(() => topNodesByPressure(nodes.value))

  const attentionChecks = computed(() =>
    buildAttentionChecks(t, {
      health: health.value,
      stats: stats.value,
      nodes: nodes.value,
      unhealthyIndices: unhealthyIndices.value,
      diskWatermarks: diskWatermarks.value,
      allocationEnable: allocationEnable.value,
      indexBlocks: indexBlocks.value,
      pendingTasks: pendingTasks.value,
      pressureSamples: pressureSamples.value,
      heapSamples: heapSamples.value,
      nodesMonitoringAvailable: nodesMonitoringAvailable.value
    })
  )

  const loadHealth = async () => {
    try {
      health.value = await callElasticsearch('clusterHealth')
    } catch (e) {
      console.error(e)
      return
    }

    // Only fetch pending-task ages when the count is high enough to matter
    const pendingCount = health.value?.number_of_pending_tasks ?? 0
    if (pendingCount < PENDING_TASKS_FETCH_THRESHOLD) {
      pendingTasks.value = pendingCount > 0 ? { count: pendingCount, oldestAgeMs: null } : null
      return
    }

    try {
      pendingTasks.value = parsePendingTasks(await callElasticsearch('clusterPendingTasks'))
    } catch {
      pendingTasks.value = { count: pendingCount, oldestAgeMs: null }
    }
  }

  const loadClusterStats = async () => {
    try {
      stats.value = await callElasticsearch('clusterStats', CLUSTER_STATS_PARAMS)
    } catch (e) {
      console.error(e)
    }
  }

  /** One call covers node resource peaks (heap/disk/cpu/FD) and workload counters. */
  const loadNodeStats = async () => {
    const [body, masterState] = await Promise.all([
      callElasticsearch('nodesStats', HOME_NODES_STATS.metrics, HOME_NODES_STATS.params).catch(
        () => null
      ) as Promise<NodesStatsBody | null>,
      // Elected master id — node roles alone only mean master-eligible
      callElasticsearch('clusterState', 'master_node')
        .catch(() => callElasticsearch('clusterState', 'cluster_manager_node'))
        .catch(() => null)
    ])

    if (!body) {
      nodesMonitoringAvailable.value = false
      return
    }

    nodesMonitoringAvailable.value = true
    nodes.value = parseNodesFromStats(body, parseElectedMasterNodeId(masterState))
    recordSamples(body)
  }

  const recordSamples = (body: NodesStatsBody) => {
    const now = Date.now()
    const newHeapSamples = nodes.value
      .filter((node) => node.heapPercent != null)
      .map((node) => ({ at: now, node: node.name, heapPercent: node.heapPercent as number }))
    heapSamples.value = trimHeapSamples([...heapSamples.value, ...newHeapSamples], now)

    const sample = aggregateCounters(body)
    const previous = lastCounterSample
    lastCounterSample = sample
    if (!sample || !previous) return

    const rates = nextWorkloadRates(previous, sample, workload.value)
    if (!rates) return

    workload.value = rates
    const pressure = { at: now, rejectedDelta: rates.rejectedDelta || 0, breakerDelta: rates.breakerDelta || 0 }
    pressureSamples.value = trimPressureSamples([...pressureSamples.value, pressure], now)
  }

  const loadIndices = async () => {
    try {
      const rows: CatIndexRow[] = await callElasticsearch('catIndices', HOME_INDEX_PARAMS)
      const parsed = parseCatIndices(Array.isArray(rows) ? rows : null)
      attentionIndices.value = parsed.indices
      attentionIndicesTotal.value = parsed.eligibleCount
      unhealthyIndices.value = parsed.unhealthy
    } catch {
      attentionIndices.value = []
      attentionIndicesTotal.value = 0
      unhealthyIndices.value = { red: [], yellow: [] }
    }
  }

  const loadIndexBlocks = async () => {
    try {
      indexBlocks.value = parseIndexBlocks(await callElasticsearch('clusterState', 'blocks'))
    } catch {
      indexBlocks.value = []
    }
  }

  /** Disk watermarks + allocation.enable (often forgotten after maintenance). */
  const loadClusterSettings = async () => {
    try {
      const settings = await callElasticsearch('clusterGetSettings', CLUSTER_SETTINGS_PARAMS)
      diskWatermarks.value = parseDiskWatermarks(settings)
      allocationEnable.value = parseAllocationEnable(settings)
    } catch {
      diskWatermarks.value = { ...DEFAULT_DISK_WATERMARKS }
      allocationEnable.value = 'all'
    }
  }

  let refreshing = false
  const refresh = async () => {
    if (refreshing) return
    refreshing = true
    try {
      await Promise.all([
        loadHealth(),
        loadNodeStats(),
        loadClusterStats(),
        loadIndices(),
        loadIndexBlocks(),
        loadClusterSettings()
      ])
    } finally {
      refreshing = false
    }
  }

  onMounted(refresh)

  return {
    stats,
    health,
    clusterStatus,
    nodes,
    topNodes,
    attentionIndices,
    attentionIndicesTotal,
    nodesMonitoringAvailable,
    diskWatermarks,
    workload,
    versionLabel,
    maxHeap,
    maxDisk,
    maxCpu,
    attentionChecks,
    refresh
  }
}
