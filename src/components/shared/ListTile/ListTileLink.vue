<template>
  <v-list-tile @click="run">
    <v-list-tile-action v-if="icon">
      <v-icon small>{{icon}}</v-icon>
    </v-list-tile-action>
    <v-list-tile-content>
      <v-list-tile-title>{{linkTitle}}</v-list-tile-title>
    </v-list-tile-content>
  </v-list-tile>
</template>

<script>
  import { elasticsearchRequest } from '@/mixins/ElasticsearchAdapterHelper'

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
    methods: {
      run () {
        elasticsearchRequest({
          method: this.method,
          methodParams: this.methodParams,
          callback: this.callback,
          growl: this.growl,
          confirmMessage: this.confirmMessage
        })
      }
    }
  }
</script>
