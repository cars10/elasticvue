import { onMounted, ref, Ref } from 'vue'
import { useElasticsearchAdapter, RequestState } from '../../CallElasticsearch'
import { EsIndex } from './IndicesTable.ts'
import { clusterVersionGte } from '../../../helpers/minClusterVersion.ts'
import { useIndicesStore } from '../../../store/indices.ts'

type CatIndicesParams = {
  h: string
  bytes: string
  expand_wildcards?: string
}

type AliasData = {
  aliases: Record<string, object>
}

type IndexGetAliasResponse = Record<string, AliasData>

export const useClusterIndices = () => {
  const indicesStore = useIndicesStore()
  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const data: Ref<EsIndex[] | null> = ref(null)

  const CAT_INDICES_PARAMS: CatIndicesParams = {
    h: 'index,health,status,uuid,pri,rep,docs.count,store.size,sc,cd',
    bytes: 'b'
  }
  if (clusterVersionGte(8)) CAT_INDICES_PARAMS.expand_wildcards = 'all'

  const load = async () => {
    try {
      const [indices, aliasesData] = (await Promise.all([
        callElasticsearch('catIndices', CAT_INDICES_PARAMS),
        callElasticsearch('indexGetAlias', { index: '*' })
      ])) as [EsIndex[], IndexGetAliasResponse]

      indices.forEach((index: EsIndex) => {
        if (aliasesData[index.index] && aliasesData[index.index].aliases) {
          index.aliases = Object.keys(aliasesData[index.index].aliases).sort()
        } else {
          index.aliases = []
        }
      })

      data.value = indices
    } catch (e) {
      console.error(e)
      data.value = null
    }
  }

  onMounted(load)

  return {
    indicesStore,
    requestState: requestState as Ref<RequestState>,
    data,
    load
  }
}
