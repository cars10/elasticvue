import { computed, onMounted, ref, shallowRef } from 'vue'
import { useElasticsearchAdapter } from '../../CallElasticsearch'
import { flattenObj } from '../../../helpers/flatten.ts'
import { buildNodeRows, CAT_NODES_PARAMS, summarizeNodes } from '../../../helpers/nodes.ts'
import {
  DEFAULT_DISK_WATERMARKS,
  NODES_STATS_METRICS,
  parseDiskWatermarks,
  parseNodeStatsDetails
} from '../../../helpers/nodeStats.ts'
import { RATE_HISTORY_LIMIT } from '../../../helpers/homeDashboard.ts'
import type { EsNode, NodeAttributes } from '../../../types/types.ts'
import type { DiskWatermarks, NodesStatsBody } from '../../../types/homeDashboard.ts'
import type { NodeStatsDetails } from '../../../types/nodes.ts'

/** Attributes and disk watermarks rarely change, so they are refreshed at most this often. */
const SLOW_REFRESH_MS = 30_000

export const useClusterNodes = () => {
  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const { callElasticsearch: callEnrichment } = useElasticsearchAdapter()

  // API responses are always replaced as a whole, so shallow refs are enough and avoid deep proxies
  const catNodes = shallowRef<EsNode[]>([])
  const details = shallowRef<Record<string, NodeStatsDetails>>({})
  const attributes = shallowRef<Record<string, Record<string, string>>>({})
  const diskWatermarks = shallowRef<DiskWatermarks>({ ...DEFAULT_DISK_WATERMARKS })
  const nodesStatsAvailable = ref<boolean | null>(null)

  // Cluster averages collected across reloads for the pulse sparklines
  const cpuHistory = shallowRef<number[]>([])
  const heapHistory = shallowRef<number[]>([])
  let lastSlowRefreshAt = 0

  const nodes = computed(() => buildNodeRows(catNodes.value, details.value, attributes.value))
  const summary = computed(() => summarizeNodes(nodes.value, diskWatermarks.value))

  const loadCatNodes = async () => {
    try {
      catNodes.value = (await callElasticsearch('catNodes', CAT_NODES_PARAMS)) as EsNode[]
    } catch (e) {
      console.error(e)
    }
  }

  /** Uptime, docs and store size; the page still works without monitoring permission. */
  const loadNodeStats = async () => {
    let body: NodesStatsBody | null
    try {
      body = await callEnrichment('nodesStats', NODES_STATS_METRICS)
    } catch {
      nodesStatsAvailable.value = false
      return
    }

    nodesStatsAvailable.value = true
    details.value = parseNodeStatsDetails(body)
  }

  const loadAttributes = async () => {
    try {
      const body = (await callEnrichment('nodes')) as NodeAttributes
      attributes.value = Object.fromEntries(
        Object.entries(body.nodes || {}).map(([id, node]) => [id, flattenObj(node?.settings?.node?.attr)])
      )
    } catch {
      // Attributes are enrichment; listing nodes should still work without them
    }
  }

  const loadDiskWatermarks = async () => {
    try {
      const settings = await callEnrichment('clusterGetSettings', { include_defaults: true, flat_settings: true })
      diskWatermarks.value = parseDiskWatermarks(settings)
    } catch {
      diskWatermarks.value = { ...DEFAULT_DISK_WATERMARKS }
    }
  }

  const recordHistory = () => {
    const { cpu, heap } = summary.value
    if (cpu.avg != null) cpuHistory.value = [...cpuHistory.value, cpu.avg].slice(-RATE_HISTORY_LIMIT)
    if (heap.avg != null) heapHistory.value = [...heapHistory.value, heap.avg].slice(-RATE_HISTORY_LIMIT)
  }

  const load = async () => {
    const requests = [loadCatNodes(), loadNodeStats()]

    const now = Date.now()
    if (now - lastSlowRefreshAt >= SLOW_REFRESH_MS) {
      lastSlowRefreshAt = now
      requests.push(loadAttributes(), loadDiskWatermarks())
    }

    await Promise.all(requests)
    recordHistory()
  }

  onMounted(load)

  return {
    requestState,
    nodes,
    summary,
    diskWatermarks,
    nodesStatsAvailable,
    cpuHistory,
    heapHistory,
    load
  }
}
