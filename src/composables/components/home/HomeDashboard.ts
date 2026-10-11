import { computed, onMounted, ref, Ref } from 'vue'
import { useElasticsearchAdapter } from '../../CallElasticsearch'
import { useConnectionStore } from '../../../store/connection.ts'
import { DISTRIBUTIONS } from '../../../consts.ts'
import {
  aggregateCounters,
  DEFAULT_DISK_WATERMARKS,
  EMPTY_WORKLOAD,
  HOME_INDEX_PARAMS,
  nextWorkloadRates,
  NODES_STATS_METRICS,
  parseCatIndices,
  parseDiskWatermarks,
  parseNodesFromStats,
  topNodesByPressure
} from '../../../helpers/homeDashboard.ts'
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
  AttentionCheck,
  CatIndexRow,
  ClusterHealth,
  ClusterInfo,
  ClusterStats,
  CounterSample,
  DiskWatermarks,
  HeapSample,
  IndexBlock,
  MetricPeak,
  NodesStatsBody,
  OverviewIndex,
  OverviewNode,
  PendingTaskInfo,
  PressureSample,
  WorkloadRates
} from '../../../types/homeDashboard.ts'

export const useHomeDashboard = () => {
  const connectionStore = useConnectionStore()
  const { callElasticsearch } = useElasticsearchAdapter()

  const stats: Ref<ClusterStats | null> = ref(null)
  const health: Ref<ClusterHealth | null> = ref(null)
  const clusterInfo: Ref<ClusterInfo | null> = ref(null)
  const nodes: Ref<OverviewNode[]> = ref([])
  const attentionIndices: Ref<OverviewIndex[]> = ref([])
  const attentionIndicesTotal: Ref<number> = ref(0)
  const unhealthyIndices = ref<{ red: string[]; yellow: string[] }>({ red: [], yellow: [] })
  const nodesMonitoringAvailable: Ref<boolean | null> = ref(null)
  const diskWatermarks: Ref<DiskWatermarks> = ref({ ...DEFAULT_DISK_WATERMARKS })
  const allocationEnable: Ref<AllocationEnable> = ref('all')
  const indexBlocks: Ref<IndexBlock[]> = ref([])
  const pendingTasks: Ref<PendingTaskInfo | null> = ref(null)
  const workload: Ref<WorkloadRates> = ref({ ...EMPTY_WORKLOAD })
  const lastSample = ref<CounterSample | null>(null)
  const pressureSamples: Ref<PressureSample[]> = ref([])
  const heapSamples: Ref<HeapSample[]> = ref([])

  const peakMetric = (list: OverviewNode[], key: 'diskPercent' | 'cpuPercent'): MetricPeak => {
    let best: MetricPeak = { value: null, node: null }
    for (const node of list) {
      const value = node[key]
      if (value == null) continue
      if (best.value == null || value > best.value) best = { value, node: node.name }
    }
    return best
  }

  const versionLabel = computed(() => {
    const version = clusterInfo.value?.version?.number || connectionStore.activeCluster?.version
    const distribution =
      clusterInfo.value?.version?.distribution || connectionStore.activeCluster?.distribution || DISTRIBUTIONS.elasticsearch
    if (!version) return null
    const product = distribution === DISTRIBUTIONS.opensearch ? 'OpenSearch' : 'Elasticsearch'
    return `${product} ${version}`
  })

  const maxHeap = computed((): MetricPeak => {
    let best: MetricPeak = { value: null, node: null, detail: null }
    for (const node of nodes.value) {
      const value = node.heapPercent
      if (value == null) continue
      if (best.value == null || value > best.value) {
        best = {
          value,
          node: node.name,
          detail: node.heapCurrent && node.heapMax ? `${node.heapCurrent} / ${node.heapMax}` : null
        }
      }
    }
    return best
  })

  const maxDisk = computed((): MetricPeak => peakMetric(nodes.value, 'diskPercent'))
  const maxCpu = computed((): MetricPeak => peakMetric(nodes.value, 'cpuPercent'))

  /** Table preview only — full `nodes` still feeds charts, attention, and workload. */
  const topNodes = computed(() => topNodesByPressure(nodes.value))

  const attentionChecks = computed((): AttentionCheck[] =>
    buildAttentionChecks({
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

  /** Cluster inventory + shard health. Both APIs exist since ES 1.x. */
  const loadClusterOverview = async () => {
    try {
      const [statsBody, healthBody] = await Promise.all([
        callElasticsearch('clusterStats'),
        callElasticsearch('clusterHealth')
      ])
      stats.value = statsBody
      health.value = healthBody

      // Only fetch pending-task ages when the count is high enough to matter
      const pendingCount = healthBody?.number_of_pending_tasks ?? 0
      if (pendingCount >= PENDING_TASKS_FETCH_THRESHOLD) {
        await loadPendingTasks()
      } else {
        pendingTasks.value = pendingCount > 0 ? { count: pendingCount, oldestAgeMs: null } : null
      }
    } catch (e) {
      console.error(e)
    }
  }

  const loadPendingTasks = async () => {
    try {
      const body = await callElasticsearch('clusterPendingTasks')
      pendingTasks.value = parsePendingTasks(body)
    } catch {
      const count = health.value?.number_of_pending_tasks ?? 0
      pendingTasks.value = count > 0 ? { count, oldestAgeMs: null } : null
    }
  }

  /**
   * Single call covers node resource peaks (heap/disk/cpu/FD) and workload counters.
   * Also feeds short-term samples used by Attention detectors (not the KPI cards).
   */
  const loadNodesAndWorkload = async () => {
    try {
      const body = (await callElasticsearch('nodesStats', NODES_STATS_METRICS)) as NodesStatsBody
      nodesMonitoringAvailable.value = true

      const parsed = parseNodesFromStats(body)
      nodes.value = parsed

      const now = Date.now()
      const nextHeap: HeapSample[] = []
      for (const node of parsed) {
        if (node.heapPercent == null) continue
        nextHeap.push({ at: now, node: node.name, heapPercent: node.heapPercent })
      }
      heapSamples.value = trimHeapSamples([...heapSamples.value, ...nextHeap], now)

      const sample = aggregateCounters(body)
      if (!sample) return

      const prev = lastSample.value
      lastSample.value = sample
      if (!prev) return

      const next = nextWorkloadRates(prev, sample, workload.value)
      if (!next) return

      workload.value = next
      pressureSamples.value = trimPressureSamples(
        [
          ...pressureSamples.value,
          {
            at: now,
            rejectedDelta: next.rejectedDelta || 0,
            breakerDelta: next.breakerDelta || 0
          }
        ],
        now
      )
    } catch {
      nodesMonitoringAvailable.value = false
    }
  }

  const loadAttentionIndices = async () => {
    try {
      const rows = (await callElasticsearch('catIndices', HOME_INDEX_PARAMS)) as CatIndexRow[]
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

  /** Version/build metadata — static for the session. */
  const loadClusterInfo = async () => {
    try {
      clusterInfo.value = await callElasticsearch('clusterInfo')
    } catch {
      const cluster = connectionStore.activeCluster
      if (!cluster) return
      clusterInfo.value = {
        cluster_name: cluster.clusterName,
        cluster_uuid: cluster.uuid,
        version: {
          number: cluster.version,
          distribution: cluster.distribution,
          build_flavor: cluster.flavor
        }
      }
    }
  }

  /**
   * Settings rarely change. Loaded once.
   * Covers disk watermarks + allocation.enable (forgotten after maintenance).
   */
  const loadClusterSettings = async () => {
    try {
      const settings = await callElasticsearch('clusterGetSettings', {
        include_defaults: true,
        flat_settings: true
      })
      diskWatermarks.value = parseDiskWatermarks(settings)
      allocationEnable.value = parseAllocationEnable(settings)
    } catch {
      diskWatermarks.value = { ...DEFAULT_DISK_WATERMARKS }
      allocationEnable.value = 'all'
    }
  }

  /** Index blocks — light `_cluster/state/blocks` slice; not polled every second. */
  const loadIndexBlocks = async () => {
    try {
      const body = await callElasticsearch('clusterState', 'blocks')
      indexBlocks.value = parseIndexBlocks(body)
    } catch {
      indexBlocks.value = []
    }
  }

  const refresh = async () => {
    await Promise.all([loadClusterOverview(), loadNodesAndWorkload(), loadAttentionIndices()])
  }

  onMounted(() => {
    loadClusterInfo()
    loadClusterSettings()
    loadIndexBlocks()
    refresh()
  })

  return {
    stats,
    health,
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
