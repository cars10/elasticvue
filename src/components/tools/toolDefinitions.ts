import { Component, computed } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'
import type { ClusterTools } from '../../composables/components/tools/ClusterTools.ts'
import { useToolLabels } from '../../composables/components/tools/ToolLabels.ts'
import AllocationTool from './AllocationTool.vue'
import RebalancingTool from './RebalancingTool.vue'
import WatermarksTool from './WatermarksTool.vue'
import RecoveryTool from './RecoveryTool.vue'
import DestructiveTool from './DestructiveTool.vue'
import AutoCreateTool from './AutoCreateTool.vue'
import ClusterWriteTool from './ClusterWriteTool.vue'
import UnassignedTool from './UnassignedTool.vue'
import RemoveNodeTool from './RemoveNodeTool.vue'
import RestartTool from './RestartTool.vue'
import WritesTool from './WritesTool.vue'
import IndexSettingsTool from './IndexSettingsTool.vue'

export const TOOL_GROUPS = ['maintenance', 'settings'] as const

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
  available?: boolean
  onOpen?: () => unknown
}

const CLUSTER_SETTINGS = ['PUT /_cluster/settings']
const INDEX_SETTINGS = ['PUT /{indices}/_settings']

export const useToolDefinitions = (tools: ClusterTools) => {
  const t = useTranslation()
  const labels = useToolLabels()

  const unassignedStatus = () => {
    const count = tools.unassignedCount.value
    return count ? t('tools.status.unassigned', { count }, count) : t('tools.status.no_unassigned')
  }

  const autoCreateStatus = () => {
    const { source, effectiveValue } = tools.autoCreateSetting.value
    if (source === 'default') return t('tools.status.default')
    if (effectiveValue === false || effectiveValue === 'false') return t('tools.status.disabled')
    if (effectiveValue === true || effectiveValue === 'true') return labels.autoCreateMode('allow')
    return labels.autoCreateMode('custom')
  }

  return computed<ToolDefinition[]>(() => {
    const excludedCount = tools.excludedNodeIds.value.length
    const blockedCount = tools.blockedUserIndices.value.length + (tools.clusterWriteMode.value === 'normal' ? 0 : 1)
    const singleNodeCount = tools.singleNodeReplicaIndices.value.length
    const definitions: ToolDefinition[] = [
      {
        id: 'unassigned',
        title: t('tools.unassigned.title'),
        description: t('tools.unassigned.description'),
        keywords: t('tools.unassigned.keywords'),
        group: 'maintenance',
        component: UnassignedTool,
        endpoints: [
          ...(tools.capabilities.allocationExplain ? ['GET /_cluster/allocation/explain'] : []),
          ...CLUSTER_SETTINGS,
          ...INDEX_SETTINGS,
          ...(tools.capabilities.retryFailed ? ['POST /_cluster/reroute?retry_failed=true'] : [])
        ],
        status: unassignedStatus(),
        attention: tools.unassignedCount.value > 0,
        onOpen: tools.loadShards
      },
      {
        id: 'remove_node',
        title: t('tools.drain.title'),
        description: t('tools.drain.description'),
        keywords: t('tools.drain.keywords'),
        group: 'maintenance',
        component: RemoveNodeTool,
        endpoints: [
          ...CLUSTER_SETTINGS,
          ...(tools.capabilities.votingExclusions
            ? ['POST /_cluster/voting_config_exclusions', 'DELETE /_cluster/voting_config_exclusions']
            : [])
        ],
        status: excludedCount
          ? t('tools.drain.status_active', { count: excludedCount }, excludedCount)
          : t('tools.drain.status_none'),
        attention: excludedCount > 0,
        onOpen: () => Promise.all([tools.loadNodes(), tools.loadShards(), tools.loadVotingExclusions()])
      },
      {
        id: 'restart',
        title: t('tools.restart.title'),
        description: t('tools.restart.description'),
        keywords: t('tools.restart.keywords'),
        group: 'maintenance',
        component: RestartTool,
        endpoints: [...CLUSTER_SETTINGS, 'POST /_all/_flush'],
        status: tools.allocationMode.value === 'primaries' ? t('tools.restart.status_paused') : t('tools.restart.status'),
        attention: false
      },
      {
        id: 'writes',
        title: t('tools.writes.title'),
        description: t('tools.writes.description'),
        keywords: t('tools.writes.keywords'),
        group: 'maintenance',
        component: WritesTool,
        endpoints: [...CLUSTER_SETTINGS, ...INDEX_SETTINGS],
        status: blockedCount ? t('tools.writes.status', { count: blockedCount }, blockedCount) : t('tools.writes.none'),
        attention: blockedCount > 0,
        onOpen: tools.loadNodes
      },
      {
        id: 'allocation',
        title: t('tools.allocation.title'),
        description: t('tools.allocation.description'),
        keywords: t('tools.allocation.keywords'),
        group: 'settings',
        component: AllocationTool,
        endpoints: CLUSTER_SETTINGS,
        status: labels.allocationMode(tools.allocationMode.value),
        attention: tools.allocationMode.value !== 'all'
      },
      {
        id: 'rebalancing',
        title: t('tools.rebalancing.title'),
        description: t('tools.rebalancing.description'),
        keywords: t('tools.rebalancing.keywords'),
        group: 'settings',
        component: RebalancingTool,
        endpoints: CLUSTER_SETTINGS,
        status: labels.rebalancingMode(tools.rebalancingMode.value),
        attention: tools.rebalancingMode.value !== 'all'
      },
      {
        id: 'watermarks',
        title: t('tools.watermarks.title'),
        description: t('tools.watermarks.description'),
        keywords: t('tools.watermarks.keywords'),
        group: 'settings',
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
        group: 'settings',
        component: RecoveryTool,
        endpoints: CLUSTER_SETTINGS,
        status: tools.recoverySetting.value.effectiveValue || t('tools.status.unavailable'),
        attention: false
      },
      {
        id: 'index_settings',
        title: t('tools.index_settings.title'),
        description: t('tools.index_settings.description'),
        keywords: t('tools.index_settings.keywords'),
        group: 'settings',
        component: IndexSettingsTool,
        endpoints: INDEX_SETTINGS,
        status: singleNodeCount
          ? t('tools.replicas.status_single_node', { count: singleNodeCount }, singleNodeCount)
          : t('tools.index_settings.status'),
        attention: singleNodeCount > 0 || tools.userIndices.value.some((index) => index.refreshInterval === '-1')
      },
      {
        id: 'destructive',
        title: t('tools.destructive.title'),
        description: t('tools.destructive.description'),
        keywords: t('tools.destructive.keywords'),
        group: 'settings',
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
        group: 'settings',
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
        group: 'settings',
        component: ClusterWriteTool,
        endpoints: CLUSTER_SETTINGS,
        status: labels.clusterWriteMode(tools.clusterWriteMode.value),
        attention: tools.clusterWriteMode.value !== 'normal'
      }
    ]

    return definitions.filter((definition) => definition.available !== false)
  })
}
