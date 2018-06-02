import { DEFAULT_SEARCH_PARAMS } from '../consts'
import { isEmpty } from './utilities'

export function normalizeSearchParams (params) {
  params.q = isEmpty(params.q) ? DEFAULT_SEARCH_PARAMS.q : params.q
  params.from = isEmpty(params.from) ? DEFAULT_SEARCH_PARAMS.from : parseInt(params.from)
  params.size = isEmpty(params.size) ? DEFAULT_SEARCH_PARAMS.size : parseInt(params.size)
  params.index = isEmpty(params.index) ? DEFAULT_SEARCH_PARAMS.index : params.index
}
