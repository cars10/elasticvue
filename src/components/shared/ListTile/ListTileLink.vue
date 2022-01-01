<template>
  <v-list-item @click="run">
    <v-list-item-action v-if="icon">
      <v-icon small>{{ icon }}</v-icon>
    </v-list-item-action>
    <v-list-item-content>
      <v-list-item-title>{{ linkTitle }}</v-list-item-title>
    </v-list-item-content>
  </v-list-item>
</template>

<script>
  import { useElasticsearchRequest } from '@/mixins/RequestComposition'
  import { showSnackbar } from '@/mixins/ShowSnackbar'

  export default {
    name: 'list-tile-link',
    props: {
      icon: {
        type: String,
        default: ''
      },
      linkTitle: {
        type: String,
        default: ''
      },
      method: {
        type: String,
        default: ''
      },
      methodParams: {
        type: Object,
        default: () => {
          return {}
        }
      },
      callback: {
        type: Function,
        default: () => {
        }
      },
      growl: {
        type: String,
        default: ''
      },
      confirmMessage: {
        type: String,
        default: ''
      }
    },
    setup (props) {
      const { requestState, callElasticsearch } = useElasticsearchRequest()

      const run = () => {
        if ((props.confirmMessage && confirm(props.confirmMessage)) || props.confirmMessage.length === 0) {
          callElasticsearch(props.method, props.methodParams)
            .then(body => {
              if (typeof props.callback === 'function') props.callback(body)

              showSnackbar(requestState.value, { title: props.growl, body: JSON.stringify(body) })
              return Promise.resolve(body)
            })
            .catch(() => showSnackbar(requestState.value))
        }
      }

      return {
        run
      }
    }
  }
</script>
