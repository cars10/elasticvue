import { computed, onMounted, ref, Ref, shallowRef } from 'vue'
import { useElasticsearchAdapter, RequestState } from '../../CallElasticsearch'
import { EsIndex } from './IndicesTable.ts'
import { clusterVersionGte } from '../../../helpers/minClusterVersion.ts'
import { useIndicesStore } from '../../../store/indices.ts'
import ElasticsearchIndex from '../../../models/ElasticsearchIndex.ts'
import {
  aliasesByIndex,
  CAT_ALIASES_PARAMS,
  INDEX_BLOCKS_PARAMS,
  isHiddenIndex,
  NO_BLOCKS,
  parseIndexBlocks,
  summarizeIndices
} from '../../../helpers/indices.ts'
import type { EsIndicesBlocksSettings } from '../../../types/indices.ts'

export const useClusterIndices = () => {
  const indicesStore = useIndicesStore()
  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  // Separate adapter so enrichment 403s do not flip LoaderStatus into the error state
  const { callElasticsearch: callEnrichment } = useElasticsearchAdapter()
  const indices = shallowRef<ElasticsearchIndex[]>([])
  const blocksKnown = ref(false)

  const catIndicesParams = {
    h: 'index,health,status,uuid,pri,rep,docs.count,store.size,sc,cd',
    bytes: 'b',
    ...(clusterVersionGte(8) && { expand_wildcards: 'all' })
  }

  const summary = computed(() =>
    summarizeIndices(
      indices.value.filter(
        (index) => indicesStore.showHiddenIndices || !isHiddenIndex(index.index, indicesStore.hideIndicesRegex)
      ),
      blocksKnown.value
    )
  )

  const load = async () => {
    const [indicesResult, aliasesResult, blocksResult] = await Promise.allSettled([
      callElasticsearch('catIndices', catIndicesParams) as Promise<EsIndex[]>,
      callEnrichment('catAliases', CAT_ALIASES_PARAMS) as Promise<{ alias: string; index: string }[]>,
      callEnrichment('indexGetAllSettings', INDEX_BLOCKS_PARAMS) as Promise<EsIndicesBlocksSettings>
    ])

    if (indicesResult.status === 'rejected') {
      indices.value = []
      return
    }

    const aliases = aliasesByIndex(aliasesResult.status === 'fulfilled' ? aliasesResult.value : null)
    const blocks = blocksResult.status === 'fulfilled' ? parseIndexBlocks(blocksResult.value) : null
    blocksKnown.value = blocks !== null

    indices.value = indicesResult.value.map(
      (index) =>
        new ElasticsearchIndex({
          ...index,
          aliases: aliases[index.index] || [],
          blocks: blocks ? blocks[index.index] || NO_BLOCKS : null
        })
    )
  }

  onMounted(load)

  return {
    indicesStore,
    requestState: requestState as Ref<RequestState>,
    indices,
    summary,
    load
  }
}
