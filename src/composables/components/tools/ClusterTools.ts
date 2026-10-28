import { computed, inject, InjectionKey, provide, ref } from 'vue'
import { useElasticsearchAdapter } from '../../CallElasticsearch.ts'
import { useSnackbar } from '../../Snackbar.ts'
import { useTranslation } from '../../i18n.ts'
import {
  addAllocationExclusion,
  clusterToolsCapabilities,
  effectiveSetting,
  indicesNeedingZeroReplicaHelper,
  parseCommaSeparated,
  parseIndexToolStates,
  removeAllocationExclusion,
  settingMode,
  userManagedIndices
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

type SettingValue = string | number | boolean | null

const isTrue = (value: unknown) => value === true || value === 'true'

const shardNodeName = (shard: ToolShard) => shard.node?.split(/\s|->/)[0]

export const useClusterTools = () => {
  const t = useTranslation()
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

  const setting = <T = string>(key: string, fallback: T | null = null) =>
    computed(() => effectiveSetting<T>(settings.value, key, fallback))

  const allocationSetting = setting('cluster.routing.allocation.enable', 'all')
  const allocationMode = computed(() => settingMode(allocationSetting.value))
  const rebalancingSetting = setting('cluster.routing.rebalance.enable', 'all')
  const rebalancingMode = computed(() => settingMode(rebalancingSetting.value))
  const recoverySetting = setting('indices.recovery.max_bytes_per_sec')
  const autoCreateSetting = setting<string | boolean>('action.auto_create_index')
  const awarenessSetting = setting('cluster.routing.allocation.awareness.attributes', '')
  const destructiveSetting = computed(() => {
    const fallback =
      !connectionStore.elasticsearch || Number.parseInt(connectionStore.activeCluster?.majorVersion || '0', 10) >= 8
    return effectiveSetting<string | boolean>(settings.value, 'action.destructive_requires_name', fallback)
  })
  const destructiveEnabled = computed(() => isTrue(destructiveSetting.value.effectiveValue))

  const watermarkSettings = {
    low: setting('cluster.routing.allocation.disk.watermark.low', '85%'),
    high: setting('cluster.routing.allocation.disk.watermark.high', '90%'),
    flood: setting('cluster.routing.allocation.disk.watermark.flood_stage', '95%'),
    thresholdEnabled: setting<string | boolean>('cluster.routing.allocation.disk.threshold_enabled', true),
    lowMaxHeadroom: setting('cluster.routing.allocation.disk.watermark.low.max_headroom'),
    highMaxHeadroom: setting('cluster.routing.allocation.disk.watermark.high.max_headroom'),
    floodMaxHeadroom: setting('cluster.routing.allocation.disk.watermark.flood_stage.max_headroom')
  }
  const watermarksCustom = computed(() =>
    Object.values(watermarkSettings).some((s) => s.value.source === 'persistent' || s.value.source === 'transient')
  )

  const clusterReadOnly = setting<string | boolean>('cluster.blocks.read_only', false)
  const clusterReadOnlyAllowDelete = setting<string | boolean>('cluster.blocks.read_only_allow_delete', false)
  const clusterWriteMode = computed(() => {
    if (isTrue(clusterReadOnly.value.effectiveValue)) return 'read_only'
    if (isTrue(clusterReadOnlyAllowDelete.value.effectiveValue)) return 'allow_delete'
    return 'normal'
  })

  const unassignedShards = computed(() =>
    shards.value.filter((shard) => shard.state?.toUpperCase() === 'UNASSIGNED' || !shard.node)
  )
  const dataNodeCount = computed(
    () =>
      nodes.value.filter((node) => node.roles.some((role) => role === 'data' || role.startsWith('data_')) || node.shardCount > 0)
        .length
  )
  const excludedNodeIds = computed(() =>
    parseCommaSeparated(effectiveSetting<string>(settings.value, 'cluster.routing.allocation.exclude._id', '').effectiveValue)
  )
  const userIndices = computed(() => userManagedIndices(indices.value))
  const blockedUserIndices = computed(() => userIndices.value.filter((index) => index.blocks.length))
  const singleNodeReplicaIndices = computed(() => indicesNeedingZeroReplicaHelper(indices.value, dataNodeCount.value))
  const awarenessAttributes = computed(() => parseCommaSeparated(awarenessSetting.value.effectiveValue))

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
      const shardsByNode = new Map<string, ToolShard[]>()
      for (const shard of shards.value) {
        const name = shardNodeName(shard)
        if (!name) continue
        shardsByNode.set(name, [...(shardsByNode.get(name) || []), shard])
      }

      nodes.value = Object.entries(nodeBody?.nodes || {}).map(([id, raw]) => {
        const node = raw as { name?: string; roles?: string[]; attributes?: Record<string, string> }
        const nodeShards = shardsByNode.get(node.name || '') || []
        const fs = stats.nodes?.[id]?.fs?.total
        const total = fs?.total_in_bytes
        const available = fs?.available_in_bytes ?? fs?.free_in_bytes
        const relocating = nodeShards.filter((shard) => shard.state === 'RELOCATING').length
        return {
          id,
          name: node.name || id,
          roles: node.roles || [],
          attributes: node.attributes || {},
          shardCount: nodeShards.length - relocating,
          initialShardCount: nodeShards.length,
          relocatingShards: relocating,
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

  const loadVotingExclusions = async () => {
    if (!capabilities.votingExclusions) return
    try {
      const body = await votingApi.callElasticsearch('clusterGetVotingExclusions')
      votingExclusions.value = body?.metadata?.cluster_coordination?.voting_config_exclusions || []
    } catch (_error) {
      votingExclusions.value = []
    }
  }

  const refresh = async () => {
    await Promise.allSettled([loadSettings(), loadShards(), loadHealth(), loadIndices(), loadVotingExclusions()])
    await loadNodes()
  }

  const mutate = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action()
      showSnackbar(mutationApi.requestState.value, { body: success })
      return true
    } catch (_error) {
      showSnackbar(mutationApi.requestState.value)
      return false
    }
  }

  const putClusterSettings = (values: Record<string, SettingValue>) =>
    mutationApi.callElasticsearch('clusterPutSettings', {
      persistent: values,
      transient: Object.fromEntries(Object.keys(values).map((key) => [key, null]))
    })

  const setClusterSettings = async (values: Record<string, SettingValue>, success: string) => {
    const changed = await mutate(() => putClusterSettings(values), success)
    if (changed) await loadSettings()
    return changed
  }

  const setAllocation = async (value: string | null) => {
    const changed = await mutate(
      () => putClusterSettings({ 'cluster.routing.allocation.enable': value }),
      value === null ? t('tools.allocation.restored') : t('tools.allocation.updated', { value })
    )
    if (changed) await Promise.allSettled([loadSettings(), loadShards(), loadHealth()])
    return changed
  }

  const explainShard = async (shard: ToolShard) => {
    explanation.value = null
    const body = { index: shard.index, shard: Number(shard.shard), primary: shard.prirep === 'p' }
    try {
      explanation.value = await explainApi.callElasticsearch('clusterAllocationExplain', { body, includeDiskInfo: true })
    } catch (_error) {
      if (explainApi.requestState.value.status !== 400) return
      try {
        explanation.value = await explainApi.callElasticsearch('clusterAllocationExplain', { body })
      } catch (_secondError) {
        // The error state is rendered by the explain tool
      }
    }
  }

  const retryFailed = async () => {
    const changed = await mutate(() => mutationApi.callElasticsearch('clusterRetryFailedAllocations'), t('tools.retry.done'))
    if (changed) await Promise.allSettled([loadShards(), loadHealth()])
    return changed
  }

  const setNodeDrain = async (nodeId: string, draining: boolean) => {
    await loadSettings()
    const key = 'cluster.routing.allocation.exclude._id'
    const current = [
      ...parseCommaSeparated(settings.value?.persistent?.[key]),
      ...parseCommaSeparated(settings.value?.transient?.[key])
    ].join(',')
    const value = draining ? addAllocationExclusion(current, nodeId) : removeAllocationExclusion(current, nodeId)
    const changed = await mutate(
      () => putClusterSettings({ [key]: value }),
      draining ? t('tools.drain.started') : t('tools.drain.stopped')
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

  const clearIndexBlocks = (selected: string[], blocks: string[]) =>
    updateIndexSettings(
      selected,
      { index: { blocks: Object.fromEntries(blocks.map((block) => [block, false])) } },
      t('tools.blocks.cleared', { count: selected.length }, selected.length)
    )

  const setReplicas = (selected: string[], replicas: number) =>
    updateIndexSettings(
      selected,
      { index: { number_of_replicas: replicas } },
      t('tools.replicas.updated', { count: selected.length }, selected.length)
    )

  const setRefreshInterval = (selected: string[], interval: string | null) =>
    updateIndexSettings(
      selected,
      { index: { refresh_interval: interval ?? (capabilities.settingsReset ? null : '1s') } },
      t('tools.refresh.updated', { count: selected.length }, selected.length)
    )

  const addVotingExclusions = async (nodeIds: string[]) => {
    const changed = await mutate(
      () => mutationApi.callElasticsearch('clusterAddVotingExclusions', { nodeIds }),
      t('tools.voting.added', { count: nodeIds.length }, nodeIds.length)
    )
    if (changed) await loadVotingExclusions()
    return changed
  }

  const clearVotingExclusions = async () => {
    const changed = await mutate(() => mutationApi.callElasticsearch('clusterClearVotingExclusions'), t('tools.voting.cleared'))
    if (changed) await loadVotingExclusions()
    return changed
  }

  const setWatermarks = (values: WatermarkValues | null) => {
    const prefix = 'cluster.routing.allocation.disk'
    const update: Record<string, SettingValue> = {
      [`${prefix}.threshold_enabled`]: values?.thresholdEnabled ?? null,
      [`${prefix}.watermark.low`]: values?.low ?? null,
      [`${prefix}.watermark.high`]: values?.high ?? null
    }
    if (capabilities.floodStage) update[`${prefix}.watermark.flood_stage`] = values?.flood ?? null
    if (capabilities.maxHeadroom) {
      update[`${prefix}.watermark.low.max_headroom`] = values?.lowMaxHeadroom || null
      update[`${prefix}.watermark.high.max_headroom`] = values?.highMaxHeadroom || null
      if (capabilities.floodStage) update[`${prefix}.watermark.flood_stage.max_headroom`] = values?.floodMaxHeadroom || null
    }
    return setClusterSettings(update, values ? t('tools.watermarks.updated') : t('tools.watermarks.restored'))
  }

  const setClusterWriteMode = (mode: string) =>
    setClusterSettings(
      {
        'cluster.blocks.read_only': mode === 'read_only',
        ...(capabilities.clusterReadOnlyAllowDelete ? { 'cluster.blocks.read_only_allow_delete': mode === 'allow_delete' } : {})
      },
      mode === 'normal' ? t('tools.cluster_write.restored') : t('tools.cluster_write.updated')
    )

  return {
    capabilities,
    settings,
    shards,
    nodes,
    indices,
    health,
    explanation,
    votingExclusions,
    allocationSetting,
    allocationMode,
    rebalancingSetting,
    rebalancingMode,
    recoverySetting,
    autoCreateSetting,
    destructiveSetting,
    destructiveEnabled,
    watermarkSettings,
    watermarksCustom,
    clusterWriteMode,
    unassignedShards,
    dataNodeCount,
    excludedNodeIds,
    userIndices,
    blockedUserIndices,
    singleNodeReplicaIndices,
    awarenessAttributes,
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
    setWatermarks,
    setClusterWriteMode
  }
}

export type ClusterTools = ReturnType<typeof useClusterTools>

const clusterToolsKey: InjectionKey<ClusterTools> = Symbol('clusterTools')

export const provideClusterTools = () => {
  const tools = useClusterTools()
  provide(clusterToolsKey, tools)
  return tools
}

export const useInjectedClusterTools = () => inject(clusterToolsKey) as ClusterTools
