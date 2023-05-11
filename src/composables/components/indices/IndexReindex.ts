import { ref } from 'vue'
import { useSnackbar } from '../../Snackbar'
import { useElasticsearchAdapter } from '../../CallElasticsearch'

export const useIndexReindex = ({ index, emit }: { index: string, emit: any }) => {
  const { showSnackbar } = useSnackbar()
  const { requestState, callElasticsearch } = useElasticsearchAdapter()

  const dialog = ref(false)
  const dest = ref('')

  const reindex = async () => {
    try {
      const body = await callElasticsearch('reindex', { source: index, dest: dest.value })
      showSnackbar(requestState.value, { body: `${body.total} documents reindexed into ${dest.value}.` })
      dest.value = ''
      emit('reload')
    } catch (e) {
      console.log(requestState.value)
      showSnackbar(requestState.value)
    }
  }

  return {
    dialog,
    requestState,
    dest,
    reindex
  }
}