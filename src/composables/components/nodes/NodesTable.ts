import { computed } from 'vue'
import { filterItems } from '../../../helpers/filters.ts'
import { EsNode } from '../../../types/types.ts'
import ElasticsearchNode from '../../../models/ElasticsearchNode.ts'
import { setupFilterState } from '../shared/FilterState.ts'
import { genColumns } from '../../../helpers/tableColumns.ts'
import { useNodesStore } from '../../../store/nodes.ts'
import { useTranslation } from '../../i18n.ts'

export type NodesTableProps = { nodes: EsNode[] }

export const useNodesTable = (props: NodesTableProps) => {
  const nodesStore = useNodesStore()
  const t = useTranslation()

  const results = computed(() => props.nodes)
  const filteredResults = computed(() => {
    const nodes = filterItems<EsNode>(results.value, nodesStore.filter, ['name', 'ip', 'id', 'version'])
    return nodes.map(r => new ElasticsearchNode(r))
  })

  const filterStateProps = setupFilterState(results, filteredResults)

  const columns = genColumns([
    { label: t('cluster_nodes.node_properties.status'), field: '', align: 'left' },
    { label: t('cluster_nodes.node_properties.name'), field: 'name', align: 'left' },
    { label: t('cluster_nodes.node_properties.version'), field: 'version', align: 'left' },
    { label: t('cluster_nodes.node_properties.id'), field: 'id', align: 'left' },
    { label: t('cluster_nodes.node_properties.ip'), field: 'ip', align: 'left' },
    { label: t('cluster_nodes.node_properties.master'), field: 'master', align: 'left' },
    { label: t('cluster_nodes.node_properties.node_role'), field: 'nodeRole', align: 'left' },
    { label: t('cluster_nodes.node_properties.attr'), align: 'left' },
    { label: t('cluster_nodes.node_properties.load'), align: 'left' },
    { label: t('cluster_nodes.node_properties.cpu'), field: 'cpu', align: 'left' },
    { label: t('cluster_nodes.node_properties.ram'), field: 'ramPercent', align: 'left' },
    { label: t('cluster_nodes.node_properties.heap'), field: 'heapPercent', align: 'left' },
    { label: t('cluster_nodes.node_properties.disk'), field: 'diskPercent', align: 'left' }
  ])

  return {
    filteredResults,
    filterStateProps,
    columns
  }
}