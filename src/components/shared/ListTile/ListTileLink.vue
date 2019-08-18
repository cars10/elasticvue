<template>
  <v-list-item @click="run">
    <v-list-item-action v-if="icon">
      <v-icon small>{{icon}}</v-icon>
    </v-list-item-action>
    <v-list-item-content>
      <v-list-item-title>{{linkTitle}}</v-list-item-title>
    </v-list-item-content>
  </v-list-item>
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
