import { computed, onMounted, ref, shallowRef } from 'vue'
import { useElasticsearchAdapter } from '../../CallElasticsearch'
import { useConnectionStore } from '../../../store/connection.ts'
import { useClusterSession } from '../../../store/clusterSession.ts'
import {
  DASHBOARD_TASKS_PARAMS,
  DEFAULT_TASK_VISIBILITY,
  parseTasks,
  summarizeTasks,
  visibleTasks
} from '../../../helpers/tasks.ts'
import type { TasksSummary } from '../../../types/tasks.ts'
import { useTranslation } from '../../i18n.ts'
import { productName } from '../../../helpers/clusterInfo.ts'
import {
  aggregateCounters,
  CLUSTER_STATS_PARAMS,
  EMPTY_WORKLOAD,
  RATE_HISTORY_LIMIT,
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

const SLOW_CHANGING_INTERVAL_MS = 60_000

export const useHomeDashboard = () => {
  const t = useTranslation()
  const connectionStore = useConnectionStore()
  const session = useClusterSession()
  const { callElasticsearch } = useElasticsearchAdapter()
  const { requestState: statsRequestState, callElasticsearch: callStats } = useElasticsearchAdapter()

  const stats = shallowRef<ClusterStats | null>(null)
  const health = shallowRef<ClusterHealth | null>(null)
  const nodesBody = shallowRef<NodesStatsBody | null>(null)
  const masterNodeId = ref<string | null>(null)
  const nodes = computed<OverviewNode[]>(() => parseNodesFromStats(nodesBody.value, masterNodeId.value))
  const nodesMonitoringAvailable = ref<boolean | null>(null)
  const pendingTasks = shallowRef<PendingTaskInfo | null>(null)

  const attentionIndices = shallowRef<OverviewIndex[]>([])
  const attentionIndicesTotal = ref(0)
  const unhealthyIndices = shallowRef<{ red: string[]; yellow: string[] }>({ red: [], yellow: [] })
  const indexBlocks = shallowRef<IndexBlock[]>([])
  const diskWatermarks = shallowRef<DiskWatermarks>({ ...DEFAULT_DISK_WATERMARKS })
  const allocationEnable = ref<AllocationEnable>('all')

  const workload = shallowRef<WorkloadRates>({ ...EMPTY_WORKLOAD })
  const pressureSamples = shallowRef<PressureSample[]>([])
  const heapSamples = shallowRef<HeapSample[]>([])
  let lastCounterSample: CounterSample | null = null

  const tasksSummary = shallowRef<TasksSummary | null>(null)
  const tasksHistory = shallowRef<number[]>([])

  const clusterStatus = computed(() => (health.value?.status || stats.value?.status || '').toLowerCase())

  const versionLabel = computed(() => {
    const cluster = connectionStore.activeCluster
    const versions = stats.value?.nodes.versions
    const version = versions?.length === 1 ? versions[0] : cluster?.version
    if (!version) return null

    return `${productName(cluster?.distribution)} ${version}`.trim()
  })

  const maxCpu = computed(() => peakMetric(nodes.value, 'cpuPercent'))
  const maxDisk = computed(() => peakMetric(nodes.value, 'diskPercent'))
  const maxHeap = computed(() =>
    peakMetric(nodes.value, 'heapPercent', (node) =>
      node.heapCurrent && node.heapMax ? `${node.heapCurrent} / ${node.heapMax}` : null
    )
  )

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
      health.value = await callElasticsearch((es) => es.clusterHealth())
    } catch (e) {
      console.error(e)
      return
    }

    const pendingCount = health.value?.number_of_pending_tasks ?? 0
    if (pendingCount < PENDING_TASKS_FETCH_THRESHOLD) {
      pendingTasks.value = pendingCount > 0 ? { count: pendingCount, oldestAgeMs: null } : null
      return
    }

    try {
      pendingTasks.value = parsePendingTasks(await callElasticsearch((es) => es.clusterPendingTasks()))
    } catch {
      pendingTasks.value = { count: pendingCount, oldestAgeMs: null }
    }
  }

  const loadClusterStats = async () => {
    try {
      stats.value = await callStats((es) => es.clusterStats(CLUSTER_STATS_PARAMS))
    } catch (e) {
      console.error(e)
    }
  }

  const loadNodeStats = async () => {
    const body = (await callElasticsearch((es) => es.nodesStats(HOME_NODES_STATS.metrics, HOME_NODES_STATS.params)).catch(
      () => null
    )) as NodesStatsBody | null

    if (!body) {
      nodesMonitoringAvailable.value = false
      return
    }

    nodesMonitoringAvailable.value = true
    nodesBody.value = body
    recordSamples(body)
  }

  const loadMasterNode = async () => {
    const state = await callElasticsearch((es) => es.clusterState('master_node'))
      .catch(() => callElasticsearch((es) => es.clusterState('cluster_manager_node')))
      .catch(() => null)
    masterNodeId.value = parseElectedMasterNodeId(state) ?? null
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
      const rows: CatIndexRow[] = await callElasticsearch((es) => es.catIndices(HOME_INDEX_PARAMS))
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
      indexBlocks.value = parseIndexBlocks(await callElasticsearch((es) => es.clusterState('blocks')))
    } catch {
      indexBlocks.value = []
    }
  }

  const loadClusterSettings = async () => {
    try {
      const settings = await callElasticsearch((es) => es.clusterGetSettings(CLUSTER_SETTINGS_PARAMS))
      diskWatermarks.value = parseDiskWatermarks(settings)
      allocationEnable.value = parseAllocationEnable(settings)
    } catch {
      diskWatermarks.value = { ...DEFAULT_DISK_WATERMARKS }
      allocationEnable.value = 'all'
    }
  }

  const loadTasks = async () => {
    if (!session.capabilities.tasks) return

    try {
      const body = await callElasticsearch((es) => es.tasks(DASHBOARD_TASKS_PARAMS))
      const summary = summarizeTasks(visibleTasks(parseTasks(body), DEFAULT_TASK_VISIBILITY))
      tasksSummary.value = summary
      tasksHistory.value = [...tasksHistory.value, summary.running].slice(-RATE_HISTORY_LIMIT)
    } catch {
      tasksSummary.value = null
    }
  }

  const loadSlowChanging = () =>
    Promise.all([loadClusterStats(), loadIndices(), loadIndexBlocks(), loadClusterSettings(), loadMasterNode()])

  let refreshing = false
  let slowChangingLoadedAt = 0
  const refresh = async ({ full = false } = {}) => {
    if (refreshing || session.capabilities.serverless) return
    refreshing = true
    try {
      const requests: Promise<unknown>[] = [loadHealth(), loadNodeStats(), loadTasks()]
      if (full || Date.now() - slowChangingLoadedAt >= SLOW_CHANGING_INTERVAL_MS) {
        slowChangingLoadedAt = Date.now()
        requests.push(loadSlowChanging())
      }
      await Promise.all(requests)
    } finally {
      refreshing = false
    }
  }

  onMounted(() => refresh({ full: true }))

  return {
    stats,
    statsRequestState,
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
    tasksSummary,
    tasksHistory,
    refresh
  }
}
