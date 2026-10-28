import { Component, computed } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'
import { clusterToolIsSupported } from '../../helpers/clusterTools.ts'
import type { ClusterTools } from '../../composables/components/tools/ClusterTools.ts'
import { useToolLabels } from '../../composables/components/tools/ToolLabels.ts'
import AllocationTool from './AllocationTool.vue'
import DrainTool from './DrainTool.vue'
import ExplainTool from './ExplainTool.vue'
import RetryTool from './RetryTool.vue'
import RebalancingTool from './RebalancingTool.vue'
import BlocksTool from './BlocksTool.vue'
import ReplicasTool from './ReplicasTool.vue'
import RefreshTool from './RefreshTool.vue'
import WatermarksTool from './WatermarksTool.vue'
import RecoveryTool from './RecoveryTool.vue'
import DestructiveTool from './DestructiveTool.vue'
import AutoCreateTool from './AutoCreateTool.vue'
import ClusterWriteTool from './ClusterWriteTool.vue'
import VotingTool from './VotingTool.vue'
import AwarenessTool from './AwarenessTool.vue'

export const TOOL_GROUPS = ['shards', 'indices', 'disk', 'safety', 'advanced'] as const

export type ToolDefinition = {
  id: string
  title: string
  description: string
  keywords: string
  group: (typeof TOOL_GROUPS)[number]
  component: Component
  endpoints: string[]
  status: string
  attention: boolean
  onOpen?: () => void
}

const CLUSTER_SETTINGS = ['PUT /_cluster/settings']
const INDEX_SETTINGS = ['PUT /{indices}/_settings']

export const useToolDefinitions = (tools: ClusterTools) => {
  const t = useTranslation()
  const labels = useToolLabels()

  const unassignedStatus = () => {
    const count = tools.unassignedShards.value.length
    return count ? t('tools.status.unassigned', { count }, count) : t('tools.status.no_unassigned')
  }

  const refreshStatus = () => {
    const values = new Set(tools.userIndices.value.map((index) => index.refreshInterval || 'default'))
    if (!values.size) return t('tools.status.no_user_indices')
    if (values.size > 1) return t('tools.refresh.status_mixed')
    const [value] = values
    return value === 'default' ? t('tools.status.default') : value
  }

  const autoCreateStatus = () => {
    const { source, effectiveValue } = tools.autoCreateSetting.value
    if (source === 'default') return t('tools.status.default')
    if (effectiveValue === false || effectiveValue === 'false') return t('tools.status.disabled')
    if (effectiveValue === true || effectiveValue === 'true') return labels.autoCreateMode('allow')
    return labels.autoCreateMode('custom')
  }

  return computed<ToolDefinition[]>(() => {
    const definitions: ToolDefinition[] = [
      {
        id: 'allocation',
        title: t('tools.allocation.title'),
        description: t('tools.allocation.description'),
        keywords: t('tools.allocation.keywords'),
        group: 'shards',
        component: AllocationTool,
        endpoints: CLUSTER_SETTINGS,
        status: labels.allocationMode(tools.allocationMode.value),
        attention: tools.allocationMode.value !== 'all'
      },
      {
        id: 'drain',
        title: t('tools.drain.title'),
        description: t('tools.drain.description'),
        keywords: t('tools.drain.keywords'),
        group: 'shards',
        component: DrainTool,
        endpoints: CLUSTER_SETTINGS,
        status: tools.excludedNodeIds.value.length
          ? t('tools.drain.status_active', { count: tools.excludedNodeIds.value.length }, tools.excludedNodeIds.value.length)
          : t('tools.drain.status_none'),
        attention: tools.excludedNodeIds.value.length > 0,
        onOpen: tools.loadNodes
      },
      {
        id: 'explain',
        title: t('tools.explain.title'),
        description: t('tools.explain.description'),
        keywords: t('tools.explain.keywords'),
        group: 'shards',
        component: ExplainTool,
        endpoints: [],
        status: unassignedStatus(),
        attention: tools.unassignedShards.value.length > 0
      },
      {
        id: 'retry',
        title: t('tools.retry.title'),
        description: t('tools.retry.description'),
        keywords: t('tools.retry.keywords'),
        group: 'shards',
        component: RetryTool,
        endpoints: ['POST /_cluster/reroute?retry_failed=true'],
        status: unassignedStatus(),
        attention: false
      },
      {
        id: 'rebalancing',
        title: t('tools.rebalancing.title'),
        description: t('tools.rebalancing.description'),
        keywords: t('tools.rebalancing.keywords'),
        group: 'shards',
        component: RebalancingTool,
        endpoints: CLUSTER_SETTINGS,
        status: labels.rebalancingMode(tools.rebalancingMode.value),
        attention: tools.rebalancingMode.value !== 'all'
      },
      {
        id: 'blocks',
        title: t('tools.blocks.title'),
        description: t('tools.blocks.description'),
        keywords: t('tools.blocks.keywords'),
        group: 'indices',
        component: BlocksTool,
        endpoints: INDEX_SETTINGS,
        status: tools.blockedUserIndices.value.length
          ? t('tools.blocks.status', { count: tools.blockedUserIndices.value.length }, tools.blockedUserIndices.value.length)
          : t('tools.blocks.status_none'),
        attention: tools.blockedUserIndices.value.length > 0,
        onOpen: tools.loadIndices
      },
      {
        id: 'replicas',
        title: t('tools.replicas.title'),
        description: t('tools.replicas.description'),
        keywords: t('tools.replicas.keywords'),
        group: 'indices',
        component: ReplicasTool,
        endpoints: INDEX_SETTINGS,
        status: tools.singleNodeReplicaIndices.value.length
          ? t(
              'tools.replicas.status_single_node',
              { count: tools.singleNodeReplicaIndices.value.length },
              tools.singleNodeReplicaIndices.value.length
            )
          : t('tools.replicas.status'),
        attention: tools.singleNodeReplicaIndices.value.length > 0,
        onOpen: tools.loadIndices
      },
      {
        id: 'refresh',
        title: t('tools.refresh.title'),
        description: t('tools.refresh.description'),
        keywords: t('tools.refresh.keywords'),
        group: 'indices',
        component: RefreshTool,
        endpoints: INDEX_SETTINGS,
        status: refreshStatus(),
        attention: tools.userIndices.value.some((index) => index.refreshInterval === '-1'),
        onOpen: tools.loadIndices
      },
      {
        id: 'watermarks',
        title: t('tools.watermarks.title'),
        description: t('tools.watermarks.description'),
        keywords: t('tools.watermarks.keywords'),
        group: 'disk',
        component: WatermarksTool,
        endpoints: CLUSTER_SETTINGS,
        status: tools.watermarksCustom.value ? t('tools.status.custom') : t('tools.status.default'),
        attention: tools.watermarksCustom.value,
        onOpen: tools.loadNodes
      },
      {
        id: 'recovery',
        title: t('tools.recovery.title'),
        description: t('tools.recovery.description'),
        keywords: t('tools.recovery.keywords'),
        group: 'disk',
        component: RecoveryTool,
        endpoints: CLUSTER_SETTINGS,
        status: tools.recoverySetting.value.effectiveValue || t('tools.status.unavailable'),
        attention: false
      },
      {
        id: 'destructive',
        title: t('tools.destructive.title'),
        description: t('tools.destructive.description'),
        keywords: t('tools.destructive.keywords'),
        group: 'safety',
        component: DestructiveTool,
        endpoints: CLUSTER_SETTINGS,
        status: tools.destructiveEnabled.value ? t('tools.status.enabled') : t('tools.status.disabled'),
        attention: false
      },
      {
        id: 'auto_create',
        title: t('tools.auto_create.title'),
        description: t('tools.auto_create.description'),
        keywords: t('tools.auto_create.keywords'),
        group: 'safety',
        component: AutoCreateTool,
        endpoints: CLUSTER_SETTINGS,
        status: autoCreateStatus(),
        attention: false
      },
      {
        id: 'cluster_write',
        title: t('tools.cluster_write.title'),
        description: t('tools.cluster_write.description'),
        keywords: t('tools.cluster_write.keywords'),
        group: 'advanced',
        component: ClusterWriteTool,
        endpoints: CLUSTER_SETTINGS,
        status: labels.clusterWriteMode(tools.clusterWriteMode.value),
        attention: tools.clusterWriteMode.value !== 'normal'
      },
      {
        id: 'voting',
        title: t('tools.voting.title'),
        description: t('tools.voting.description'),
        keywords: t('tools.voting.keywords'),
        group: 'advanced',
        component: VotingTool,
        endpoints: ['POST /_cluster/voting_config_exclusions', 'DELETE /_cluster/voting_config_exclusions'],
        status: tools.votingExclusions.value.length
          ? t('tools.voting.status', { count: tools.votingExclusions.value.length })
          : t('tools.voting.status_none'),
        attention: tools.votingExclusions.value.length > 0,
        onOpen: tools.loadVotingExclusions
      },
      {
        id: 'awareness',
        title: t('tools.awareness.title'),
        description: t('tools.awareness.description'),
        keywords: t('tools.awareness.keywords'),
        group: 'advanced',
        component: AwarenessTool,
        endpoints: [],
        status: tools.awarenessAttributes.value.length
          ? t('tools.awareness.status', { count: tools.awarenessAttributes.value.length }, tools.awarenessAttributes.value.length)
          : t('tools.awareness.status_none'),
        attention: false,
        onOpen: tools.loadNodes
      }
    ]

    return definitions.filter((definition) => clusterToolIsSupported(definition.id, tools.capabilities))
  })
}
