import { computed } from 'vue'
import { filterItems } from '../../../helpers/filters.ts'
import { setupFilterState } from '../shared/FilterState.ts'
import { genColumns } from '../../../helpers/tableColumns.ts'
import { useNodesStore } from '../../../store/nodes.ts'
import { useTranslation } from '../../i18n.ts'
import { clusterVersionGte } from '../../../helpers/minClusterVersion.ts'
import type { NodeRow } from '../../../types/nodes.ts'

export type NodesTableProps = { nodes: NodeRow[]; loading: boolean }

export const useNodesTable = (props: NodesTableProps) => {
  const nodesStore = useNodesStore()
  const t = useTranslation()

  const results = computed(() => props.nodes)
  const filteredResults = computed(() => {
    const list = results.value.filter(
      (r) => nodesStore.nodeRoles.length === 0 || nodesStore.nodeRoles.some((role) => r.roles.includes(role))
    )
    return filterItems<NodeRow>(list, nodesStore.filter, ['name', 'ip', 'id', 'version'])
  })

  const filterStateProps = setupFilterState(results, filteredResults)

  const showNodeShards = clusterVersionGte(8)

  const columns = genColumns([
    { label: t('cluster_nodes.node_properties.name'), field: 'name', align: 'left' },
    { label: t('cluster_nodes.node_properties.node_role'), align: 'left' },
    { label: t('cluster_nodes.node_properties.version'), field: 'version', align: 'left' },
    showNodeShards ? { label: t('cluster_nodes.node_properties.shards'), field: 'shards', align: 'right' } : null,
    { label: t('cluster_nodes.node_properties.docs'), field: 'docs', align: 'right' },
    { label: t('cluster_nodes.node_properties.store'), field: 'storeBytes', align: 'right' },
    { label: t('cluster_nodes.node_properties.uptime'), field: 'uptimeMs', align: 'right' },
    { label: t('cluster_nodes.node_properties.attr'), align: 'left' },
    { label: t('cluster_nodes.node_properties.cpu'), field: 'cpuPercent', align: 'left' },
    { label: t('cluster_nodes.node_properties.heap'), field: 'heapPercent', align: 'left' },
    { label: t('cluster_nodes.node_properties.disk'), field: 'diskPercent', align: 'left' }
  ])

  return {
    filteredResults,
    filterStateProps,
    columns,
    showNodeShards
  }
}
