<template>
  <q-item clickable @click="run">
    <q-item-section side>
      <q-icon :name="icon" size="xs" />
    </q-item-section>
    <q-item-section>
      <q-item-label>{{ text }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
  import { useElasticsearchAdapter } from '../../composables/CallElasticsearch'
  import { useSnackbar } from '../../composables/Snackbar'
  import { askConfirm } from '../../helpers/dialogs'
  import { ElasticsearchMethod } from '../../services/ElasticsearchAdapter'

  const props = defineProps<{
    method: ElasticsearchMethod,
    index: string,
    icon: string,
    text: string,
    growl: string,
    confirm?: string
  }>()
  const emit = defineEmits(['done'])

  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const { showSnackbar } = useSnackbar()

  const load = () => {
    callElasticsearch(props.method, { index: props.index })
        .then(body => {
          emit('done')
          showSnackbar(requestState.value, { title: props.growl, body: JSON.stringify(body) })
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
</script>