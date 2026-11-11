import { ref, shallowRef } from 'vue'
import { useClusterSession } from '../../../store/clusterSession.ts'
import { useElasticsearchAdapter } from '../../CallElasticsearch.ts'
import { catalogFromFieldCaps, catalogFromMappings, emptyCatalog } from '../../../helpers/search/fieldCatalog.ts'
import { targetKey } from '../../../helpers/search/columns.ts'
import type { FieldCatalog } from '../../../types/search.ts'

export const FIELD_CATALOG_INDEX_LIMIT = 500

const catalogs = new Map<string, Promise<FieldCatalog>>()

export const useFieldCatalog = () => {
  const session = useClusterSession()
  const { callElasticsearch } = useElasticsearchAdapter()
  const catalog = shallowRef<FieldCatalog>(emptyCatalog())
  const skipped = ref(false)
  let latest = 0

  const fetchCatalog = async (index: string): Promise<FieldCatalog> => {
    const { fieldCaps, fieldCapsUnmapped } = session.capabilities.search
    if (!fieldCaps) {
      return catalogFromMappings(await callElasticsearch((es) => es.indexMappings({ index })))
    }

    const params = fieldCapsUnmapped ? { include_unmapped: 'true' } : undefined
    return catalogFromFieldCaps(await callElasticsearch((es) => es.fieldCaps({ index, params })))
  }

  const load = async (targets: string[], { force = false, matchedIndices = 0 } = {}) => {
    const request = ++latest
    skipped.value = matchedIndices > FIELD_CATALOG_INDEX_LIMIT
    if (skipped.value) {
      catalog.value = emptyCatalog()
      return
    }

    const index = targetKey(targets)
    const key = `${session.connectionId}|${index}`
    if (force) catalogs.delete(key)

    if (!catalogs.has(key)) {
      catalogs.set(
        key,
        fetchCatalog(index).catch(() => {
          catalogs.delete(key)
          return emptyCatalog()
        })
      )
    }

    const result = await catalogs.get(key)!
    if (request === latest) catalog.value = result
  }

  return { catalog, skipped, load }
}
