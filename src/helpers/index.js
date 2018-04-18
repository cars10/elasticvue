import { ELASTICSEARCH_API_VERSIONS, DEFAULT_SEARCH_PARAMS } from '../consts'
import { isEmpty } from './utilities'

/**
 * Return the correct api version for the elasticsearch version.
 * For example elasticsearch version '6.1' uses api version '6.x'
 * @param version
 * @returns {string}
 */
export function mapElasticsearchApiVersion (version) {
  switch (version) {
    case ELASTICSEARCH_API_VERSIONS:
      return version
    case '6.1':
      return '6.x'
    default:
      return '6.x'
  }
}

export function normalizeSearchParams (params) {
  params.q = isEmpty(params.q) ? DEFAULT_SEARCH_PARAMS.q : params.q
  params.from = isEmpty(params.from) ? DEFAULT_SEARCH_PARAMS.from : parseInt(params.from)
  params.size = isEmpty(params.size) ? DEFAULT_SEARCH_PARAMS.size : parseInt(params.size)
  params.index = isEmpty(params.index) ? DEFAULT_SEARCH_PARAMS.index : params.index
}
