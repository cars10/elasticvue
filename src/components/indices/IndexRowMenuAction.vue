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

<script setup>
  import { useElasticsearchAdapter } from '../../composables/RequestComposition'
  import { useSnackbar } from '../../composables/UseSnackbar'
  import { askConfirm } from '../../helpers/dialogs'

  const props = defineProps({
    method: {
      type: String,
      default: ''
    },
    index: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    text: {
      type: String,
      default: ''
    },
    growl: {
      type: String,
      default: ''
    },
    confirm: {
      type: String,
      default: ''
    }
  })
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

  const run = () => {
    if (props.confirm) {
      askConfirm(props.confirm).then(confirmed => {
        if (confirmed) load()
      })
    } else if (props.confirm.length === 0) {
      load()
    }
  }
</script>