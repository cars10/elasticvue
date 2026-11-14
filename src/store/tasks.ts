import { defineStore } from 'pinia'
import { useConnectionStore } from './connection'
import {
  PaginationStorePartial,
  ReloadIntervalStorePartial,
  paginationStoreDefaultProps,
  persistPaginationProps,
  persistReloadIntervalProps,
  DEFAULT_RELOAD_INTERVAL
} from './shared'
import { DEFAULT_HIDDEN_CATEGORIES, DEFAULT_HIDDEN_TYPES } from '../helpers/tasks.ts'
import type { TaskCategory } from '../types/tasks.ts'

type TasksState = {
  filter: string
  hiddenTypes: string[]
  hiddenCategories: TaskCategory[]
  stickyTableHeader: boolean
} & PaginationStorePartial &
  ReloadIntervalStorePartial

export const useTasksStore = () => {
  const connectionStore = useConnectionStore()
  const clusterId = connectionStore.activeClusterId || ''
  return defineStore(`tasks-${clusterId}`, {
    state: (): TasksState => ({
      filter: '',
      hiddenTypes: [...DEFAULT_HIDDEN_TYPES],
      hiddenCategories: [...DEFAULT_HIDDEN_CATEGORIES],
      stickyTableHeader: false,
      pagination: paginationStoreDefaultProps('runningMs', true),
      reloadInterval: DEFAULT_RELOAD_INTERVAL
    }),
    persist: {
      pick: [
        'filter',
        'hiddenTypes',
        'hiddenCategories',
        'stickyTableHeader',
        ...persistPaginationProps(),
        ...persistReloadIntervalProps()
      ],
      key: `tasks-${clusterId}`
    }
  })()
}
