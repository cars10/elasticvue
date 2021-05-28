import * as Comlink from 'comlink'
import { filterItems } from '@/helpers/filters'

class FilterWorker {
  filter (items, search, headers) {
    return filterItems(items, search, headers)
  }
}

Comlink.expose(FilterWorker)
