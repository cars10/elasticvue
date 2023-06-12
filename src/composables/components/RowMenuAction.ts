import { useElasticsearchAdapter } from '../CallElasticsearch.ts'
import { useSnackbar } from '../Snackbar.ts'
import { askConfirm } from '../../helpers/dialogs.ts'
import { ElasticsearchMethod } from '../../services/ElasticsearchAdapter.ts'

export const useRowMenuAction = ({ method, methodParams = {}, growl, confirm, emit }: {
  method: ElasticsearchMethod,
  methodParams: any,
  growl: string | undefined,
  confirm: string | undefined,
  emit: any
}) => {
  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const { showSnackbar } = useSnackbar()

  const load = () => {
    callElasticsearch(method, methodParams)
        .then(body => {
          emit('done')
          showSnackbar(requestState.value, { title: growl, body: JSON.stringify(body) })
        })
        .catch(() => showSnackbar(requestState.value))
  }

  const run = async () => {
    if (confirm) {
      const confirmed = await askConfirm(confirm)
      if (confirmed) load()
    } else {
      load()
    }
  }

  return {
    run
  }
}