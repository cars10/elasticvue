import { useTranslation } from '../../i18n.ts'
import { defineElasticsearchRequest } from '../../CallElasticsearch.ts'
import type { ClusterTask } from '../../../types/tasks.ts'

export type TaskRowProps = {
  task: ClusterTask
}

export const useTaskRow = (props: TaskRowProps, emit: any) => {
  const t = useTranslation()
  const { run, loading } = defineElasticsearchRequest({ emit })

  const cancelTask = () =>
    run({
      confirmMsg: t('tasks.task.cancel.confirm', { action: props.task.action, id: props.task.id }),
      request: (es) => es.taskCancel({ taskId: props.task.id }),
      snackbarOptions: { body: t('tasks.task.cancel.growl', { id: props.task.id }) }
    })

  return { cancelTask, cancelling: loading }
}
