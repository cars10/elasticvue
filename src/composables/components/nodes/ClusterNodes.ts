import { computed, onMounted, ref, shallowRef } from 'vue'
import { useElasticsearchAdapter } from '../../CallElasticsearch'
import { flattenObj } from '../../../helpers/flatten.ts'
import {
  buildNodeRows,
  CAT_NODES_PARAMS,
  NODE_ATTRIBUTES_PARAMS,
  NODE_DETAILS_STATS,
  summarizeNodes
} from '../../../helpers/nodes.ts'
import {
  CLUSTER_SETTINGS_PARAMS,
  DEFAULT_DISK_WATERMARKS,
  parseDiskWatermarks,
  parseNodeStatsDetails
} from '../../../helpers/nodeStats.ts'
import { RATE_HISTORY_LIMIT } from '../../../helpers/homeDashboard.ts'
import type { EsNode, NodeAttributes } from '../../../types/types.ts'
import type { DiskWatermarks, NodesStatsBody } from '../../../types/homeDashboard.ts'
import type { NodeStatsDetails } from '../../../types/nodes.ts'

export const useClusterNodes = () => {
  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const { callElasticsearch: callEnrichment } = useElasticsearchAdapter()

  const catNodes = shallowRef<EsNode[]>([])
  const details = shallowRef<Record<string, NodeStatsDetails>>({})
  const attributes = shallowRef<Record<string, Record<string, string>>>({})
  const diskWatermarks = shallowRef<DiskWatermarks>({ ...DEFAULT_DISK_WATERMARKS })
  const nodesStatsAvailable = ref<boolean | null>(null)

  const cpuHistory = shallowRef<number[]>([])
  const heapHistory = shallowRef<number[]>([])

  const nodes = computed(() => buildNodeRows(catNodes.value, details.value, attributes.value))
  const summary = computed(() => summarizeNodes(nodes.value, diskWatermarks.value))

  const loadCatNodes = async () => {
    try {
      catNodes.value = (await callElasticsearch('catNodes', CAT_NODES_PARAMS)) as EsNode[]
    } catch (e) {
      console.error(e)
    }
  }

  const loadNodeStats = async () => {
    let body: NodesStatsBody | null
    try {
      body = await callEnrichment('nodesStats', NODE_DETAILS_STATS.metrics, NODE_DETAILS_STATS.params)
    } catch {
      nodesStatsAvailable.value = false
      return
    }

    nodesStatsAvailable.value = true
    details.value = parseNodeStatsDetails(body)
  }

  const loadAttributes = async () => {
    try {
      const body = (await callEnrichment('nodesInfo', 'settings', NODE_ATTRIBUTES_PARAMS)) as NodeAttributes
      attributes.value = Object.fromEntries(
        Object.entries(body.nodes || {}).map(([id, node]) => [id, flattenObj(node?.settings?.node?.attr)])
      )
    } catch {
      // Attributes are enrichment; listing nodes should still work without them
    }
  }

  const loadDiskWatermarks = async () => {
    try {
      const settings = await callEnrichment('clusterGetSettings', CLUSTER_SETTINGS_PARAMS)
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
    await Promise.all([loadCatNodes(), loadNodeStats(), loadAttributes(), loadDiskWatermarks()])
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
