import { useElasticsearchAdapter } from '../CallElasticsearch.ts'
import { ElasticsearchRequest } from '../../services/ElasticsearchAdapter.ts'
import { useSnackbar } from '../Snackbar.ts'
import { askConfirm } from '../../helpers/dialogs.ts'
import { stringifyJson } from '../../helpers/json/stringify.ts'

export const useRowMenuAction = (
  props: { request: ElasticsearchRequest; growl?: string; confirm?: string },
  emit: (event: 'done') => void
) => {
  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const { showSnackbar } = useSnackbar()

  const load = () => {
    callElasticsearch(props.request)
      .then((body) => {
        emit('done')
        showSnackbar(requestState.value, { title: props.growl, body: stringifyJson(body) })
      })
      .catch(() => showSnackbar(requestState.value))
  }

  const run = async () => {
    if (props.confirm) {
      const confirmed = await askConfirm(props.confirm)
      if (confirmed) load()
    } else {
      load()
    }
  }

  return {
    run,
    requestState
  }
}
