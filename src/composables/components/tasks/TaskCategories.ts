import { computed } from 'vue'
import { useTranslation } from '../../i18n.ts'
import type { TaskCategory } from '../../../types/tasks.ts'

export const useTaskCategories = () => {
  const t = useTranslation()

  const categoryLabels = computed<Record<TaskCategory, string>>(() => ({
    reindex: t('tasks.categories.reindex'),
    update_by_query: t('tasks.categories.update_by_query'),
    delete_by_query: t('tasks.categories.delete_by_query'),
    forcemerge: t('tasks.categories.forcemerge'),
    snapshot: t('tasks.categories.snapshot'),
    search: t('tasks.categories.search'),
    write: t('tasks.categories.write'),
    indices: t('tasks.categories.indices'),
    monitor: t('tasks.categories.monitor'),
    cluster: t('tasks.categories.cluster'),
    other: t('tasks.categories.other')
  }))

  const categoryLabel = (category: TaskCategory) => categoryLabels.value[category]

  return { categoryLabel }
}
