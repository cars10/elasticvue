import { useTranslation } from '../../i18n'
import { computed, ref } from 'vue'
import { defineElasticsearchRequest, useElasticsearchAdapter } from '../../CallElasticsearch'

export const useNewIndex = ({ emit }: { emit: any }) => {
  const t = useTranslation()
  const { requestState, } = useElasticsearchAdapter()

  const dialog = ref(false)
  const index = ref({
    name: '',
    shards: 1,
    replicas: 1
  })

  const formValid = computed(() => {
    return index.value.name.length > 0 && index.value.shards > 0
  })

  const resetForm = () => {
    index.value = {
      name: '',
      shards: 1,
      replicas: 1
    }
  }

  const closeDialog = () => {
    resetForm()
    dialog.value = false
  }

  const callCreate = defineElasticsearchRequest({ emit, method: 'indexCreate' })
  const createIndex = async () => {
    const success = await callCreate({
      params: {
        index: index.value.name,
        body: { settings: { number_of_shards: index.value.shards || 1, number_of_replicas: index.value.replicas || 1 } }
      },
      snackbarOptions: (body: any) => {
        return {
          title: t('indices.new_index.create_index.growl', { index: index.value.name }), body: JSON.stringify(body)
        }
      }
    })
    if (success) closeDialog()
  }

  return {
    dialog,
    index,
    formValid,
    requestState,
    createIndex,
    resetForm
  }
}