import { describe, expect, it } from 'vitest'
import {
  DASHBOARD_TASKS_PARAMS,
  DEFAULT_TASK_VISIBILITY,
  KNOWN_TASK_TYPES,
  parseTasks,
  summarizeTasks,
  TASKS_PARAMS,
  taskCategory,
  taskTypes,
  unselectedOptions,
  visibleTasks
} from '../../../src/helpers/tasks'
import type { TasksBody } from '../../../src/types/tasks'

const body: TasksBody = {
  nodes: {
    node1: {
      name: 'es-node-1',
      tasks: {
        'node1:1': {
          action: 'indices:data/write/reindex',
          description: 'reindex from [logs] to [logs-new]',
          status: { total: 1000, created: 200, updated: 50, deleted: 0, noops: 0, version_conflicts: 0 },
          start_time_in_millis: 1_700_000_000_000,
          running_time_in_nanos: 120_000_000_000,
          cancellable: true
        },
        'node1:2': {
          action: 'indices:data/write/bulk',
          start_time_in_millis: 1_700_000_090_000,
          running_time_in_nanos: 10_000_000_000,
          cancellable: false,
          parent_task_id: 'node1:1'
        },
        'node1:3': {
          action: 'cluster:monitor/tasks/lists',
          running_time_in_nanos: 1_000_000
        },
        'node1:4': {
          action: 'cluster:monitor/nodes/stats',
          running_time_in_nanos: 5_000_000
        }
      }
    },
    node2: {
      name: 'es-node-2',
      tasks: {
        'node2:7': {
          action: 'indices:data/read/search',
          description: 'indices[logs], search_type[QUERY_THEN_FETCH]',
          start_time_in_millis: 1_700_000_085_000,
          running_time_in_nanos: 15_000_000_000,
          cancellable: true,
          cancelled: false
        },
        'node2:8': {
          action: 'indices:data/read/search[phase/query]',
          running_time_in_nanos: BigInt(3_000_000_000),
          parent_task_id: 'node1:404'
        },
        'node2:9': {
          action: 'xpack/ml/job[c]',
          type: 'persistent',
          running_time_in_nanos: 86_400_000_000_000
        }
      }
    }
  }
}

describe('task request params', () => {
  it('only requests the fields the tasks page renders', () => {
    expect(TASKS_PARAMS.detailed).toBe(true)
    expect(TASKS_PARAMS.filter_path.split(',')).toEqual([
      'nodes.*.name',
      'nodes.*.tasks.*.action',
      'nodes.*.tasks.*.type',
      'nodes.*.tasks.*.description',
      'nodes.*.tasks.*.start_time_in_millis',
      'nodes.*.tasks.*.running_time_in_nanos',
      'nodes.*.tasks.*.cancellable',
      'nodes.*.tasks.*.cancelled',
      'nodes.*.tasks.*.parent_task_id',
      'nodes.*.tasks.*.status.total',
      'nodes.*.tasks.*.status.created',
      'nodes.*.tasks.*.status.updated',
      'nodes.*.tasks.*.status.deleted',
      'nodes.*.tasks.*.status.noops',
      'nodes.*.tasks.*.status.version_conflicts'
    ])
  })

  it('requests a minimal, non detailed list for the dashboard', () => {
    expect(DASHBOARD_TASKS_PARAMS).toEqual({
      filter_path:
        'nodes.*.tasks.*.action,nodes.*.tasks.*.type,nodes.*.tasks.*.running_time_in_nanos,nodes.*.tasks.*.parent_task_id'
    })
  })
})

describe('taskCategory', () => {
  it.each([
    ['indices:data/write/reindex', 'reindex'],
    ['indices:data/write/update/byquery', 'update_by_query'],
    ['indices:data/write/delete/byquery', 'delete_by_query'],
    ['indices:admin/forcemerge', 'forcemerge'],
    ['cluster:admin/snapshot/create', 'snapshot'],
    ['indices:data/read/search', 'search'],
    ['indices:data/write/bulk[s]', 'write'],
    ['indices:admin/refresh', 'indices'],
    ['cluster:monitor/nodes/stats', 'monitor'],
    ['cluster:admin/reroute', 'cluster'],
    ['xpack/ml/job[c]', 'other'],
    ['', 'other']
  ])('%s is %s', (action, category) => {
    expect(taskCategory(action)).toBe(category)
  })
})

describe('parseTasks', () => {
  it('nests children, drops its own list task and sorts by running time', () => {
    const tasks = parseTasks(body)

    expect(tasks.map((task) => task.id)).toEqual(['node2:9', 'node1:1', 'node2:7', 'node2:8', 'node1:4'])
    const reindex = tasks.find((task) => task.id === 'node1:1')
    expect(reindex?.children.map((task) => task.id)).toEqual(['node1:2'])
    expect(reindex).toMatchObject({
      node: 'es-node-1',
      category: 'reindex',
      runningMs: 120_000,
      cancellable: true,
      cancelled: false,
      progress: 25,
      progressDone: 250,
      progressTotal: 1000
    })
  })

  it('keeps tasks with unknown parents at the top level', () => {
    const tasks = parseTasks(body)
    const search = tasks.find((task) => task.id === 'node2:7')
    const orphan = tasks.find((task) => task.id === 'node2:8')

    expect(search).toMatchObject({ runningMs: 15_000, startTime: 1_700_000_085_000, progress: null })
    expect(orphan?.runningMs).toBe(3_000)
    expect(orphan?.parentId).toBe('node1:404')
  })

  it('handles missing and empty responses', () => {
    expect(parseTasks(null)).toEqual([])
    expect(parseTasks({})).toEqual([])
    expect(parseTasks({ nodes: { node1: {} } })).toEqual([])
  })

  it('parses old responses without running time, cancellable or node names', () => {
    const tasks = parseTasks({ nodes: { abc: { tasks: { 'abc:1': { action: 'indices:admin/forcemerge' } } } } })

    expect(tasks).toHaveLength(1)
    expect(tasks[0]).toMatchObject({ node: 'abc', category: 'forcemerge', runningMs: null, startTime: null, cancellable: false })
  })
})

describe('visibleTasks', () => {
  const ids = (visibility: Parameters<typeof visibleTasks>[1]) => visibleTasks(parseTasks(body), visibility).map((task) => task.id)

  it('hides persistent and monitoring tasks by default', () => {
    expect(ids(DEFAULT_TASK_VISIBILITY)).toEqual(['node1:1', 'node2:7', 'node2:8'])
  })

  it('shows everything without hidden types or categories', () => {
    expect(ids({ hiddenTypes: [], hiddenCategories: [] })).toEqual(['node2:9', 'node1:1', 'node2:7', 'node2:8', 'node1:4'])
  })

  it('filters by type and category independently', () => {
    expect(ids({ hiddenTypes: [], hiddenCategories: ['monitor'] })).toContain('node2:9')
    expect(ids({ hiddenTypes: ['persistent'], hiddenCategories: [] })).toContain('node1:4')
  })
})

describe('task types', () => {
  it('always offers the known types and adds unknown ones from the response', () => {
    expect(taskTypes([], [])).toEqual(KNOWN_TASK_TYPES)
    expect(taskTypes(parseTasks({ nodes: { a: { tasks: { 'a:1': { type: 'netty' } } } } }), ['custom'])).toEqual([
      ...KNOWN_TASK_TYPES,
      'custom',
      'netty'
    ])
  })

  it('returns the options that are not selected', () => {
    expect(unselectedOptions(['direct', 'persistent', 'transport'], ['transport'])).toEqual(['direct', 'persistent'])
    expect(unselectedOptions(['persistent', 'transport'], ['persistent', 'transport'])).toEqual([])
  })
})

describe('summarizeTasks', () => {
  it('summarizes running, background and search tasks', () => {
    const summary = summarizeTasks(visibleTasks(parseTasks(body), DEFAULT_TASK_VISIBILITY))

    expect(summary).toMatchObject({
      running: 3,
      subtasks: 1,
      longRunning: 1,
      background: 1,
      backgroundDone: 250,
      backgroundTotal: 1000,
      backgroundPercent: 25,
      searches: 2
    })
    expect(summary.longest?.id).toBe('node1:1')
    expect(summary.slowestSearch?.id).toBe('node2:7')
    expect(summary.categories).toEqual([
      { category: 'search', count: 2 },
      { category: 'reindex', count: 1 }
    ])
  })

  it('summarizes an idle cluster', () => {
    expect(summarizeTasks([])).toMatchObject({
      running: 0,
      longest: null,
      backgroundPercent: null,
      slowestSearch: null,
      categories: []
    })
  })
})
