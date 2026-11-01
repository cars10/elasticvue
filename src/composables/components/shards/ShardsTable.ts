import { useIndicesStore } from '../../../store/indices.js'
import { computed, Ref, ref, watch } from 'vue'
import { useTableColumnHover } from '../../TableColumnHover.ts'
import { useSnackbar } from '../../Snackbar.ts'
import { useElasticsearchAdapter } from '../../CallElasticsearch.ts'
import { EsShard, TableShards } from '../../../helpers/shards.ts'
import { useTranslation } from '../../i18n.ts'
import { setupFilterState } from '../shared/FilterState.ts'
import { useShardsStore } from '../../../store/shards.ts'

export type ShardsTableProps = {
  shards: TableShards
}

export const useShardsTable = (props: ShardsTableProps, emit: any) => {
  const indicesStore = useIndicesStore()

  const shardsStore = useShardsStore()
  const { markedColumnIndex, markColumn, unmarkColumn } = useTableColumnHover()

  const filteredIndexNames = computed(() => {
    let names = props.shards.indexNames || []
    if (!indicesStore.showHiddenIndices) {
      const hidden = new RegExp(indicesStore.hideIndicesRegex)
      names = names.filter((name) => !hidden.test(name))
    }
    const query = shardsStore.filter.toLowerCase().trim()
    return query ? names.filter((name) => name.includes(query)) : names
  })

  const pagination = ref({
    sortBy: '',
    descending: false,
    page: 1,
    rowsPerPage: 10,
    rowsNumber: 0
  })

  watch(filteredIndexNames, (names) => (pagination.value.rowsNumber = names.length))

  const pageIndices = computed(() => {
    const { page, rowsPerPage } = pagination.value
    if (rowsPerPage === 0) return filteredIndexNames.value
    return filteredIndexNames.value.slice((page - 1) * rowsPerPage, page * rowsPerPage)
  })

  const indicesAsRows = computed(() => shardsStore.rows === 'indices')
  const nodes = computed(() => props.shards?.nodes || [])
  const rows = computed(() => (indicesAsRows.value ? pageIndices.value : nodes.value))
  const columns = computed(() =>
    (indicesAsRows.value ? nodes.value : pageIndices.value).map((name) => ({ label: name, name, field: name }))
  )

  const cellFor = (row: string, col: string) => {
    const [node, index] = indicesAsRows.value ? [col, row] : [row, col]
    return { node, index, shards: props.shards.shards?.[node]?.[index] }
  }

  const updateTable = (requestProps: any) => {
    const { page, rowsPerPage, sortBy, descending } = requestProps.pagination

    pagination.value.page = page
    pagination.value.rowsPerPage = rowsPerPage
    pagination.value.sortBy = sortBy
    pagination.value.descending = descending
  }

  const currentReroutingShard: Ref<EsShard> = ref({} as EsShard)
  const initReroute = (shard: EsShard) => {
    if (
      currentReroutingShard.value.node === shard.node &&
      currentReroutingShard.value.index === shard.index &&
      currentReroutingShard.value.shard === shard.shard
    ) {
      currentReroutingShard.value = {} as EsShard
    } else {
      currentReroutingShard.value = shard
    }
  }

  const t = useTranslation()
  const { showSnackbar } = useSnackbar()
  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const reroute = async (shardToReroute: EsShard, targetNode: string) => {
    if (
      !confirm(
        t('shards.shards_table.reroute.confirm', {
          shard: shardToReroute.shard,
          fromNode: shardToReroute.node,
          toNode: targetNode
        })
      )
    )
      return

    const commands = [
      {
        move: {
          index: shardToReroute.index,
          shard: shardToReroute.shard,
          from_node: shardToReroute.node,
          to_node: targetNode
        }
      }
    ]

    try {
      await callElasticsearch('clusterReroute', commands)
      currentReroutingShard.value = {} as EsShard
      emit('reload')
    } catch (_e) {
      showSnackbar(requestState.value)
    }
  }

  const cancelRelocation = () => {
    currentReroutingShard.value = {} as EsShard
  }

  const nodeShardCounts = computed(() =>
    Object.fromEntries(
      Object.entries(props.shards.shards || {}).map(([node, byIndex]) => [
        node,
        Object.values(byIndex).reduce((sum, shards) => sum + shards.length, 0)
      ])
    )
  )

  const labelFor = (name: string, isIndex: boolean) =>
    isIndex
      ? { name, index: props.shards.indices[name], active: currentReroutingShard.value.index === name }
      : { name, count: nodeShardCounts.value[name] ?? 0, active: currentReroutingShard.value.node === name }

  const results = computed(() => props.shards.indexNames || [])
  const filterStateProps = setupFilterState(results, pageIndices)

  return {
    shardsStore,
    filterStateProps,
    indicesStore,
    pagination,
    indicesAsRows,
    rows,
    columns,
    updateTable,
    markedColumnIndex,
    markColumn,
    unmarkColumn,
    currentReroutingShard,
    cancelRelocation,
    initReroute,
    reroute,
    labelFor,
    cellFor
  }
}
