import type { ClusterTask, RawTask, TaskCategory, TasksBody, TasksSummary } from '../types/tasks.ts'

const PROGRESS_FIELDS = ['created', 'updated', 'deleted', 'noops', 'version_conflicts']

const tasksFilterPath = (fields: string[], withNodeNames: boolean) =>
  [...(withNodeNames ? ['nodes.*.name'] : []), ...fields.map((field) => `nodes.*.tasks.*.${field}`)].join(',')

export const TASKS_PARAMS = {
  detailed: true,
  filter_path: tasksFilterPath(
    [
      'action',
      'type',
      'description',
      'start_time_in_millis',
      'running_time_in_nanos',
      'cancellable',
      'cancelled',
      'parent_task_id',
      'status.total',
      ...PROGRESS_FIELDS.map((field) => `status.${field}`)
    ],
    true
  )
}

export const DASHBOARD_TASKS_PARAMS = {
  filter_path: tasksFilterPath(['action', 'type', 'running_time_in_nanos', 'parent_task_id'], false)
}

export const LONG_RUNNING_MS = 60_000

export const KNOWN_TASK_TYPES = ['transport', 'direct', 'persistent', 'master', 'enrich']

export const TASK_CATEGORIES: TaskCategory[] = [
  'reindex',
  'update_by_query',
  'delete_by_query',
  'forcemerge',
  'snapshot',
  'search',
  'write',
  'indices',
  'monitor',
  'cluster',
  'other'
]

export const DEFAULT_HIDDEN_TYPES = ['persistent']

export const DEFAULT_HIDDEN_CATEGORIES: TaskCategory[] = ['monitor']

export type TaskVisibility = { hiddenTypes: string[]; hiddenCategories: TaskCategory[] }

export const DEFAULT_TASK_VISIBILITY: TaskVisibility = {
  hiddenTypes: DEFAULT_HIDDEN_TYPES,
  hiddenCategories: DEFAULT_HIDDEN_CATEGORIES
}

export const BACKGROUND_CATEGORIES: TaskCategory[] = ['reindex', 'update_by_query', 'delete_by_query', 'forcemerge', 'snapshot']

const CATEGORY_PREFIXES: [string, TaskCategory][] = [
  ['indices:data/write/reindex', 'reindex'],
  ['indices:data/write/update/byquery', 'update_by_query'],
  ['indices:data/write/delete/byquery', 'delete_by_query'],
  ['indices:admin/forcemerge', 'forcemerge'],
  ['cluster:admin/snapshot', 'snapshot'],
  ['indices:data/read/', 'search'],
  ['indices:data/write/', 'write'],
  ['indices:', 'indices'],
  ['cluster:monitor/', 'monitor'],
  ['cluster:', 'cluster']
]

export const taskCategory = (action: string): TaskCategory =>
  CATEGORY_PREFIXES.find(([prefix]) => action.startsWith(prefix))?.[1] || 'other'

const isOwnListTask = (action?: string) => !!action?.startsWith('cluster:monitor/tasks/lists')

const finiteOrNull = (value: unknown): number | null => {
  if (value == null) return null
  const num = Number(value)
  return Number.isFinite(num) && num >= 0 ? num : null
}

const runningMs = (task: RawTask): number | null => {
  const nanos = finiteOrNull(task.running_time_in_nanos)
  return nanos == null ? null : Math.round(nanos / 1_000_000)
}

const taskProgress = (task: RawTask) => {
  const status = task.status
  const total = finiteOrNull(status?.total)
  if (!status || !total) return { progress: null, progressDone: null, progressTotal: null }

  const done = PROGRESS_FIELDS.reduce((sum, key) => sum + (finiteOrNull(status[key]) || 0), 0)
  return { progress: Math.min(100, (done / total) * 100), progressDone: Math.min(done, total), progressTotal: total }
}

const sortByRunningTime = (a: ClusterTask, b: ClusterTask) => (b.runningMs || 0) - (a.runningMs || 0)

export const parseTasks = (body: TasksBody): ClusterTask[] => {
  const all: ClusterTask[] = []

  for (const [nodeId, node] of Object.entries(body?.nodes || {})) {
    for (const [taskId, task] of Object.entries(node?.tasks || {})) {
      if (!task || isOwnListTask(task.action)) continue

      const action = task.action || ''
      all.push({
        id: taskId,
        node: node?.name || nodeId,
        action,
        type: task.type || '',
        category: taskCategory(action),
        description: task.description || '',
        startTime: finiteOrNull(task.start_time_in_millis),
        runningMs: runningMs(task),
        cancellable: !!task.cancellable,
        cancelled: !!task.cancelled,
        parentId: task.parent_task_id || null,
        children: [],
        ...taskProgress(task)
      })
    }
  }

  const byId = new Map(all.map((task) => [task.id, task]))
  const topLevel: ClusterTask[] = []
  for (const task of all) {
    const parent = task.parentId ? byId.get(task.parentId) : undefined
    if (parent) {
      parent.children.push(task)
    } else {
      topLevel.push(task)
    }
  }

  all.forEach((task) => task.children.sort(sortByRunningTime))
  return topLevel.sort(sortByRunningTime)
}

export const visibleTasks = (tasks: ClusterTask[], { hiddenTypes, hiddenCategories }: TaskVisibility) =>
  tasks.filter((task) => !hiddenTypes.includes(task.type) && !hiddenCategories.includes(task.category))

export const taskTypes = (tasks: ClusterTask[], hiddenTypes: string[]) => [
  ...new Set([...KNOWN_TASK_TYPES, ...hiddenTypes, ...tasks.map((task) => task.type).filter(Boolean)])
]

export const unselectedOptions = <T>(options: T[], selected: T[]) => options.filter((option) => !selected.includes(option))

const countSubtasks = (tasks: ClusterTask[]): number =>
  tasks.reduce((sum, task) => sum + task.children.length + countSubtasks(task.children), 0)

const longestOf = (tasks: ClusterTask[]) =>
  tasks.reduce<ClusterTask | null>((longest, task) => ((task.runningMs || 0) > (longest?.runningMs || 0) ? task : longest), null)

export const summarizeTasks = (tasks: ClusterTask[]): TasksSummary => {
  const categories: Partial<Record<TaskCategory, number>> = {}
  tasks.forEach((task) => (categories[task.category] = (categories[task.category] || 0) + 1))

  const background = tasks.filter((task) => BACKGROUND_CATEGORIES.includes(task.category))
  const withProgress = background.filter((task) => task.progressTotal)
  const backgroundTotal = withProgress.reduce((sum, task) => sum + (task.progressTotal || 0), 0)
  const backgroundDone = withProgress.reduce((sum, task) => sum + (task.progressDone || 0), 0)
  const searches = tasks.filter((task) => task.category === 'search')

  return {
    running: tasks.length,
    subtasks: countSubtasks(tasks),
    categories: Object.entries(categories)
      .map(([category, count]) => ({ category: category as TaskCategory, count: count || 0 }))
      .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category)),
    longest: longestOf(tasks),
    longRunning: tasks.filter((task) => (task.runningMs || 0) >= LONG_RUNNING_MS).length,
    background: background.length,
    backgroundDone,
    backgroundTotal,
    backgroundPercent: backgroundTotal > 0 ? (backgroundDone / backgroundTotal) * 100 : null,
    searches: searches.length,
    slowestSearch: longestOf(searches)
  }
}
