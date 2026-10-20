import { computed, ref } from 'vue'
import { useElasticsearchAdapter } from '../../CallElasticsearch.ts'
import { useSnackbar } from '../../Snackbar.ts'
import {
  addAllocationExclusion,
  clusterToolsCapabilities,
  effectiveSetting,
  parseIndexToolStates,
  removeAllocationExclusion
} from '../../../helpers/clusterTools.ts'
import type {
  AllocationExplanation,
  FlatClusterSettings,
  IndexToolState,
  ToolNode,
  ToolShard,
  WatermarkValues
} from '../../../types/clusterTools.ts'
import type { ClusterHealth, NodesStatsBody } from '../../../types/homeDashboard.ts'
import { useConnectionStore } from '../../../store/connection.ts'

const SETTINGS_PARAMS = { include_defaults: 'true', flat_settings: 'true' }
const SHARD_PARAMS = {
  format: 'json',
  bytes: 'b',
  h: ['index', 'shard', 'prirep', 'state', 'node', 'store']
}

export const useClusterTools = () => {
  const connectionStore = useConnectionStore()
  const capabilities = clusterToolsCapabilities(connectionStore.activeCluster?.version, !connectionStore.elasticsearch)
  const settingsApi = useElasticsearchAdapter()
  const shardsApi = useElasticsearchAdapter()
  const nodesApi = useElasticsearchAdapter()
  const indicesApi = useElasticsearchAdapter()
  const healthApi = useElasticsearchAdapter()
  const explainApi = useElasticsearchAdapter()
  const votingApi = useElasticsearchAdapter()
  const mutationApi = useElasticsearchAdapter()
  const { showSnackbar } = useSnackbar()

  const settings = ref<FlatClusterSettings | null>(null)
  const shards = ref<ToolShard[]>([])
  const nodes = ref<ToolNode[]>([])
  const indices = ref<IndexToolState[]>([])
  const health = ref<ClusterHealth | null>(null)
  const explanation = ref<AllocationExplanation | null>(null)
  const votingExclusions = ref<Array<{ node_id?: string; node_name?: string }>>([])

  const unassignedShards = computed(() =>
    shards.value.filter((shard) => shard.state?.toUpperCase() === 'UNASSIGNED' || !shard.node)
  )
  const dataNodeCount = computed(
    () =>
      nodes.value.filter((node) => node.roles.some((role) => role === 'data' || role.startsWith('data_')) || node.shardCount > 0)
        .length
  )
  const excludedNodeIds = computed(() => {
    const setting = effectiveSetting<string>(settings.value, 'cluster.routing.allocation.exclude._id', '')
    return String(setting.effectiveValue || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
  })

  const loadSettings = async () => {
    try {
      settings.value = await settingsApi.callElasticsearch('clusterGetSettings', SETTINGS_PARAMS)
    } catch (_error) {
      settings.value = null
    }
  }

  const loadShards = async () => {
    try {
      shards.value = (await shardsApi.callElasticsearch('catShards', SHARD_PARAMS)) || []
    } catch (_error) {
      shards.value = []
    }
  }

  const loadHealth = async () => {
    try {
      health.value = await healthApi.callElasticsearch('clusterHealth')
    } catch (_error) {
      health.value = null
    }
  }

  const loadNodes = async () => {
    try {
      const [nodeBody, statsBody] = await Promise.all([
        nodesApi.callElasticsearch('nodes'),
        nodesApi.callElasticsearch('nodesStats', 'fs')
      ])
      const stats = (statsBody || {}) as NodesStatsBody
      const shardRows = shards.value
      nodes.value = Object.entries(nodeBody?.nodes || {}).map(([id, raw]) => {
        const node = raw as { name?: string; roles?: string[]; attributes?: Record<string, string> }
        const nodeShards = shardRows.filter((shard) => shard.node?.split(/\s|->/)[0] === node.name)
        const fs = stats.nodes?.[id]?.fs?.total
        const total = fs?.total_in_bytes
        const available = fs?.available_in_bytes ?? fs?.free_in_bytes
        return {
          id,
          name: node.name || id,
          roles: node.roles || [],
          attributes: node.attributes || {},
          shardCount: nodeShards.filter((shard) => shard.state !== 'RELOCATING').length,
          initialShardCount: nodeShards.length,
          relocatingShards: nodeShards.filter((shard) => shard.state === 'RELOCATING').length,
          diskUsedPercent: total && available != null ? Math.round(((total - available) / total) * 1000) / 10 : null,
          diskAvailableBytes: available ?? null
        }
      })
    } catch (_error) {
      nodes.value = []
    }
  }

  const loadIndices = async () => {
    let backingIndices = new Set<string>()
    if (capabilities.dataStreams) {
      try {
        const dataStreams = await indicesApi.callElasticsearch('dataStreams')
        backingIndices = new Set(
          (dataStreams?.data_streams || []).flatMap((stream: { indices?: Array<{ index_name?: string }> }) =>
            (stream.indices || []).map((index) => index.index_name).filter((name): name is string => Boolean(name))
          )
        )
      } catch (_error) {
        // Data stream metadata is optional. Index settings remain useful.
      }
    }

    try {
      const params: Record<string, string> = { flat_settings: 'true' }
      if (capabilities.expandWildcardsAll) params.expand_wildcards = 'all'
      const body = await indicesApi.callElasticsearch('indexGetAllSettings', params)
      indices.value = parseIndexToolStates(body, backingIndices)
    } catch (_error) {
      indices.value = []
    }
  }

  const refresh = async () => {
    await Promise.allSettled([loadSettings(), loadShards(), loadHealth(), loadIndices()])
    await loadNodes()
  }

  const loadVotingExclusions = async () => {
    try {
      const body = await votingApi.callElasticsearch('clusterGetVotingExclusions')
      votingExclusions.value = body?.metadata?.cluster_coordination?.voting_config_exclusions || []
    } catch (_error) {
      votingExclusions.value = []
    }
  }

  const mutate = async (action: () => Promise<unknown>, success?: string) => {
    try {
      await action()
      showSnackbar(mutationApi.requestState.value, { body: success })
      return true
    } catch (_error) {
      showSnackbar(mutationApi.requestState.value)
      return false
    }
  }

  const setAllocation = async (value: string | null) => {
    const success =
      value === null ? 'Shard allocation restored to the Elasticsearch default.' : `Shard allocation set to ${value}.`
    const changed = await mutate(
      () =>
        mutationApi.callElasticsearch('clusterPutSettings', {
          persistent: { 'cluster.routing.allocation.enable': value },
          transient: { 'cluster.routing.allocation.enable': null }
        }),
      success
    )
    if (changed) await Promise.allSettled([loadSettings(), loadShards(), loadHealth()])
    return changed
  }

  const setClusterSettings = async (values: Record<string, string | number | boolean | null>, success: string) => {
    const changed = await mutate(
      () =>
        mutationApi.callElasticsearch('clusterPutSettings', {
          persistent: values,
          transient: Object.fromEntries(Object.keys(values).map((key) => [key, null]))
        }),
      success
    )
    if (changed) await loadSettings()
    return changed
  }

  const explainShard = async (shard: ToolShard) => {
    explanation.value = null
    try {
      explanation.value = await explainApi.callElasticsearch('clusterAllocationExplain', {
        body: {
          index: shard.index,
          shard: Number(shard.shard),
          primary: shard.prirep === 'p'
        },
        includeDiskInfo: true
      })
      return true
    } catch (_error) {
      if (explainApi.requestState.value.status !== 400) return false
      try {
        explanation.value = await explainApi.callElasticsearch('clusterAllocationExplain', {
          body: {
            index: shard.index,
            shard: Number(shard.shard),
            primary: shard.prirep === 'p'
          }
        })
        return true
      } catch (_secondError) {
        return false
      }
    }
  }

  const retryFailed = async () => {
    const changed = await mutate(
      () => mutationApi.callElasticsearch('clusterRetryFailedAllocations'),
      'Elasticsearch was asked to retry failed shard allocations.'
    )
    if (changed) await Promise.allSettled([loadShards(), loadHealth()])
    return changed
  }

  const setNodeDrain = async (nodeId: string, draining: boolean) => {
    await loadSettings()
    const key = 'cluster.routing.allocation.exclude._id'
    const current = [
      ...new Set([
        ...String(settings.value?.persistent?.[key] || '').split(','),
        ...String(settings.value?.transient?.[key] || '').split(',')
      ])
    ]
      .map((id) => id.trim())
      .filter(Boolean)
      .join(',')
    const value = draining ? addAllocationExclusion(current, nodeId) : removeAllocationExclusion(current, nodeId)
    const changed = await mutate(
      () =>
        mutationApi.callElasticsearch('clusterPutSettings', {
          persistent: { [key]: value },
          transient: { [key]: null }
        }),
      draining ? 'Node drain started.' : 'Node drain stopped.'
    )
    if (changed) {
      await Promise.allSettled([loadSettings(), loadShards()])
      await loadNodes()
    }
    return changed
  }

  const updateIndexSettings = async (selected: string[], body: object, success: string) => {
    const changed = await mutate(() => mutationApi.callElasticsearch('indexPutSettings', { indices: selected, body }), success)
    if (changed) await Promise.allSettled([loadIndices(), loadShards(), loadHealth()])
    return changed
  }

  const clearIndexBlocks = (selected: string[], blocks: string[]) => {
    const blockSettings = Object.fromEntries(blocks.map((block) => [block, null]))
    return updateIndexSettings(
      selected,
      { index: { blocks: blockSettings } },
      `Write blocks cleared for ${selected.length} indices.`
    )
  }

  const setReplicas = (selected: string[], replicas: number) =>
    updateIndexSettings(
      selected,
      { index: { number_of_replicas: replicas } },
      `Replica count updated for ${selected.length} indices.`
    )

  const setRefreshInterval = (selected: string[], interval: string | null) =>
    updateIndexSettings(
      selected,
      { index: { refresh_interval: interval } },
      interval === null
        ? `Refresh interval restored for ${selected.length} indices.`
        : `Refresh interval updated for ${selected.length} indices.`
    )

  const addVotingExclusions = async (nodeIds: string[]) => {
    const changed = await mutate(
      () => mutationApi.callElasticsearch('clusterAddVotingExclusions', { nodeIds }),
      `Added ${nodeIds.length} voting configuration exclusion(s).`
    )
    if (changed) await loadVotingExclusions()
    return changed
  }

  const clearVotingExclusions = async () => {
    const changed = await mutate(
      () => mutationApi.callElasticsearch('clusterClearVotingExclusions'),
      'Voting configuration exclusions cleared.'
    )
    if (changed) await loadVotingExclusions()
    return changed
  }

  const setWatermarks = async (
    values: WatermarkValues | null,
    support: { floodStage: boolean; maxHeadroom: boolean } = { floodStage: true, maxHeadroom: true }
  ) => {
    const persistent: Record<string, string | boolean | null> = {
      'cluster.routing.allocation.disk.threshold_enabled': values?.thresholdEnabled ?? null,
      'cluster.routing.allocation.disk.watermark.low': values?.low ?? null,
      'cluster.routing.allocation.disk.watermark.high': values?.high ?? null
    }
    if (support.floodStage) persistent['cluster.routing.allocation.disk.watermark.flood_stage'] = values?.flood ?? null
    if (support.maxHeadroom) {
      persistent['cluster.routing.allocation.disk.watermark.low.max_headroom'] = values?.lowMaxHeadroom || null
      persistent['cluster.routing.allocation.disk.watermark.high.max_headroom'] = values?.highMaxHeadroom || null
      if (support.floodStage) {
        persistent['cluster.routing.allocation.disk.watermark.flood_stage.max_headroom'] = values?.floodMaxHeadroom || null
      }
    }
    const body = {
      persistent: {
        ...persistent
      },
      transient: Object.fromEntries(Object.keys(persistent).map((key) => [key, null]))
    }
    const changed = await mutate(
      () => mutationApi.callElasticsearch('clusterPutSettings', body),
      values ? 'Disk watermarks updated.' : 'Disk watermarks restored to Elasticsearch defaults.'
    )
    if (changed) await loadSettings()
    return changed
  }

  return {
    settings,
    shards,
    nodes,
    indices,
    health,
    explanation,
    votingExclusions,
    unassignedShards,
    dataNodeCount,
    excludedNodeIds,
    requests: {
      settings: settingsApi.requestState,
      shards: shardsApi.requestState,
      nodes: nodesApi.requestState,
      indices: indicesApi.requestState,
      health: healthApi.requestState,
      explain: explainApi.requestState,
      voting: votingApi.requestState,
      mutation: mutationApi.requestState
    },
    loadSettings,
    loadShards,
    loadNodes,
    loadIndices,
    loadHealth,
    loadVotingExclusions,
    refresh,
    setAllocation,
    setClusterSettings,
    explainShard,
    retryFailed,
    setNodeDrain,
    clearIndexBlocks,
    setReplicas,
    setRefreshInterval,
    addVotingExclusions,
    clearVotingExclusions,
    setWatermarks
  }
}
