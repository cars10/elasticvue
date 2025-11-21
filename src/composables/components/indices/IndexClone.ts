import { ref } from 'vue'
import { useSnackbar } from '../../Snackbar'
import { useElasticsearchAdapter } from '../../CallElasticsearch'
import { askConfirm } from '../../../helpers/dialogs'
import { useTranslation } from '../../i18n'

export type IndexCloneProps = {
  index: string
}

export const useIndexClone = (props: IndexCloneProps, emit: any) => {
  const { showSnackbar } = useSnackbar()
  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const t = useTranslation()

  const dialog = ref(false)
  const dest = ref('')

  const checkIndexReadOnly = async (): Promise<boolean> => {
    const settingsResponse = await callElasticsearch('indexGetSettings', { index: props.index })
    const indexSettings = settingsResponse[props.index]?.settings?.index
    return indexSettings?.blocks?.write === 'true' || indexSettings?.blocks?.write === true
  }

  const setIndexReadOnly = async (readOnly: boolean): Promise<void> => {
    await callElasticsearch('indexPutSettings', {
      indices: [props.index],
      body: {
        index: {
          blocks: {
            write: readOnly
          }
        }
      }
    })
  }

  const clone = async () => {
    let isReadOnly = false
    try {
      isReadOnly = await checkIndexReadOnly()
    } catch (_e) {}

    if (!isReadOnly) {
      const confirmed = await askConfirm(t('indices.index_clone.confirm', { index: props.index, dest: dest.value }))
      if (!confirmed) return
    }

    let readOnlySet = false
    try {
      if (!isReadOnly) {
        await setIndexReadOnly(true)
        readOnlySet = true
      }

      await callElasticsearch('clone', { source: props.index, dest: dest.value })

      if (readOnlySet) await setIndexReadOnly(false)

      showSnackbar(requestState.value, { body: `Clone into ${dest.value} started.` })
      dest.value = ''
      dialog.value = false
      emit('reload')
    } catch (_e) {
      if (readOnlySet) {
        try {
          await setIndexReadOnly(false)
        } catch (restoreError) {
          console.error('Failed to restore write access:', restoreError)
        }
      }
      console.log(requestState.value)
      showSnackbar(requestState.value)
    }
  }

  return {
    dialog,
    requestState,
    dest,
    clone
  }
}
