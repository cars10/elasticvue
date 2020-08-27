<template>
  <v-list-item>
    <v-list-item-content>{{ text }}</v-list-item-content>
    <v-list-item-action>
      <v-btn :color="color" :id="name" :loading="loading" @click.native="confirmMethod">Run</v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
  import { showErrorSnackbar, showSuccessSnackbar } from '@/mixins/ShowSnackbar'
  import { computed, ref } from '@vue/composition-api'
  import { useElasticsearchRequest } from '@/mixins/RequestComposition'

  export default {
    class: 'Utility',
    props: {
      text: {
        default: '',
        type: String
      },
      method: {
        default: '',
        type: String
      },
      methodParams: {
        default: () => {
        },
        type: [Object, Array]
      },
      confirmMessage: {
        default: '',
        type: String
      },
      name: {
        default: 'utility',
        type: String
      }
    },
    setup (props) {
      const loading = ref(false)
      const { requestState, callElasticsearch } = useElasticsearchRequest()

      const runMethod = () => {
        callElasticsearch(props.method, props.methodParams)
          .then(body => showSuccessSnackbar({ text: 'Success', additionalText: JSON.stringify(body) }))
          .catch(error => showErrorSnackbar({ text: 'Error', additionalText: JSON.stringify(error) }))
      }

      const color = computed(() => {
        return requestState.apiError || requestState.networkError ? 'red' : 'primary'
      })

      const confirmMethod = () => {
        if (props.confirmMessage) {
          if (confirm(props.confirmMessage)) {
            runMethod()
          }
        } else {
          runMethod()
        }
      }

      return {
        loading,
        color,
        confirmMethod
      }
    }
  }
</script>
