export type RawTask = {
  action?: string
  type?: string
  description?: string
  status?: Record<string, number | undefined>
  start_time_in_millis?: number
  running_time_in_nanos?: number | bigint
  cancellable?: boolean
  cancelled?: boolean
  parent_task_id?: string
}

export type TasksBody = {
  nodes?: Record<string, { name?: string; tasks?: Record<string, RawTask> }>
} | null

export type TaskCategory =
  | 'reindex'
  | 'update_by_query'
  | 'delete_by_query'
  | 'forcemerge'
  | 'snapshot'
  | 'search'
  | 'write'
  | 'indices'
  | 'monitor'
  | 'cluster'
  | 'other'

export type ClusterTask = {
  id: string
  node: string
  action: string
  type: string
  category: TaskCategory
  description: string
  startTime: number | null
  runningMs: number | null
  cancellable: boolean
  cancelled: boolean
  parentId: string | null
  children: ClusterTask[]
  progress: number | null
  progressDone: number | null
  progressTotal: number | null
}

export type TasksSummary = {
  running: number
  subtasks: number
  categories: { category: TaskCategory; count: number }[]
  longest: ClusterTask | null
  longRunning: number
  background: number
  backgroundDone: number
  backgroundTotal: number
  backgroundPercent: number | null
  searches: number
  slowestSearch: ClusterTask | null
}
