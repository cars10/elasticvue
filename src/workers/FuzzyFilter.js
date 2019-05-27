import * as Comlink from 'comlink'
import { fuzzyTableFilter } from '@/helpers/filters'

class FuzzyFilter {
  filter (items, search, headers) {
    return fuzzyTableFilter(items, search, headers)
  }
}

Comlink.expose(FuzzyFilter)
