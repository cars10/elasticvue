import { computed, onMounted, shallowRef } from 'vue'
import { useElasticsearchAdapter } from '../../CallElasticsearch.ts'
import { useTasksStore } from '../../../store/tasks.ts'
import { parseTasks, summarizeTasks, TASKS_PARAMS, taskTypes, visibleTasks } from '../../../helpers/tasks.ts'
import type { TasksBody } from '../../../types/tasks.ts'

export const useClusterTasks = () => {
  const tasksStore = useTasksStore()
  const { requestState, callElasticsearch } = useElasticsearchAdapter()

  const data = shallowRef<TasksBody>(null)

  const allTasks = computed(() => parseTasks(data.value))
  const types = computed(() => taskTypes(allTasks.value, tasksStore.hiddenTypes))
  const tasks = computed(() =>
    visibleTasks(allTasks.value, { hiddenTypes: tasksStore.hiddenTypes, hiddenCategories: tasksStore.hiddenCategories })
  )
  const hiddenCount = computed(() => allTasks.value.length - tasks.value.length)
  const summary = computed(() => summarizeTasks(tasks.value))

  const load = async () => {
    try {
      data.value = await callElasticsearch((es) => es.tasks(TASKS_PARAMS))
    } catch {
      data.value = null
    }
  }

  onMounted(load)

  return { tasksStore, requestState, tasks, types, hiddenCount, summary, load }
}
