import { computed } from 'vue'
import { genColumns } from '../../../helpers/tableColumns.ts'
import { useTranslation } from '../../i18n.ts'
import { useTasksStore } from '../../../store/tasks.ts'
import { setupFilterState } from '../shared/FilterState.ts'
import { filterItems } from '../../../helpers/filters.ts'
import { TASK_CATEGORIES, unselectedOptions } from '../../../helpers/tasks.ts'
import { useTaskCategories } from './TaskCategories.ts'
import type { ClusterTask, TaskCategory } from '../../../types/tasks.ts'

export type TasksTableProps = {
  tasks: ClusterTask[]
  types: string[]
}

export const FILTER_COLUMNS = ['action', 'description', 'node', 'id']

export const useTasksTable = (props: TasksTableProps) => {
  const t = useTranslation()
  const tasksStore = useTasksStore()
  const { categoryLabel } = useTaskCategories()

  const results = computed(() => props.tasks)
  const filteredResults = computed(() => filterItems(results.value, tasksStore.filter, FILTER_COLUMNS))

  const visibleTypes = computed({
    get: () => unselectedOptions(props.types, tasksStore.hiddenTypes),
    set: (selected: string[]) => (tasksStore.hiddenTypes = unselectedOptions(props.types, selected))
  })

  const categoryOptions = computed(() => TASK_CATEGORIES.map((category) => ({ value: category, label: categoryLabel(category) })))
  const visibleCategories = computed({
    get: () => unselectedOptions(TASK_CATEGORIES, tasksStore.hiddenCategories),
    set: (selected: TaskCategory[]) => (tasksStore.hiddenCategories = unselectedOptions(TASK_CATEGORIES, selected))
  })

  const selectionLabel = (selected: number, total: number) =>
    selected === total ? t('tasks.table.all') : t('tasks.table.selected', { selected, total })
  const typesLabel = computed(() => selectionLabel(visibleTypes.value.length, props.types.length))
  const categoriesLabel = computed(() => selectionLabel(visibleCategories.value.length, TASK_CATEGORIES.length))

  const filterStateProps = setupFilterState(results, filteredResults)

  const columns = genColumns([
    { label: '' },
    { label: t('tasks.table.columns.action'), field: 'action' },
    { label: t('tasks.table.columns.description'), field: 'description' },
    { label: t('tasks.table.columns.node'), field: 'node' },
    { label: t('tasks.table.columns.progress'), field: 'progress' },
    { label: t('tasks.table.columns.running_time'), field: 'runningMs', align: 'right' },
    { label: t('tasks.table.columns.started'), field: 'startTime' },
    { label: '' }
  ])

  return {
    filterStateProps,
    filteredResults,
    visibleTypes,
    typesLabel,
    categoryOptions,
    visibleCategories,
    categoriesLabel,
    columns
  }
}
