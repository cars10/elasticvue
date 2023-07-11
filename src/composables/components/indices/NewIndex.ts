import { useTranslation } from '../../i18n'
import { computed, ref } from 'vue'
import { defineElasticsearchRequest } from '../../CallElasticsearch'

export const useNewIndex = (emit: any) => {
  const t = useTranslation()

  const dialog = ref(false)
  const index = ref({
    name: '',
    shards: 1,
    replicas: 1
  })

  const formValid = computed(() => (index.value.name.length > 0 && index.value.shards > 0))

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

  const { run, loading } = defineElasticsearchRequest({ emit, method: 'indexCreate' })
  const createIndex = async () => {
    const success = await run({
      params: {
        index: index.value.name,
        body: { settings: { number_of_shards: index.value.shards || 1, number_of_replicas: index.value.replicas || 1 } }
      },
      snackbarOptions: (body: any) => {
        return {
          title: t('indices.new_index.create_index.growl', { index: index.value.name }),
          body: JSON.stringify(body)
        }
      }
    })
    if (success) closeDialog()
  }

  return {
    dialog,
    index,
    formValid,
    loading,
    createIndex,
    resetForm
  }
}