<template>
  <div>
    <template v-if="hasAnyError">
      <template v-if="apiError" :apiErrorMessage="apiErrorMessage">
        <div class="pa-3">
          <v-alert :value="true">{{apiErrorMessage}}</v-alert>
        </div>
      </template>
      <template v-else-if="networkError">
        <div class="pa-3">
          <v-alert :value="true" color="grey">Network error: failed to fetch</v-alert>
        </div>
      </template>
    </template>

    <template v-else>
      <template v-if="renderContentWhileLoading">
        <slot v-bind:body="body" v-bind:loading="loading">No data</slot>
      </template>
      <slot v-else-if="loading" name="progress">
        <v-progress-linear color="blue" indeterminate/>
      </slot>
      <slot v-else v-bind:body="body || {}">No data</slot>
    </template>
  </div>
</template>

<script>
  import Request from '@/mixins/Request'
  import { flattenObject } from '../../helpers/utilities'

  export default {
    name: 'DataLoader',
    mixins: [Request],
    props: {
      method: {
        type: String,
        default: ''
      },
      methodParams: {
        default: () => {
          return {}
        },
        type: Object
      },
      execute: {
        default: true,
        type: Boolean
      },
      flatten: {
        default: false,
        type: Boolean
      },
      renderContentWhileLoading: {
        default: false,
        type: Boolean
      }
    },
    created () {
      if (this.execute) this.loadData()
    },
    methods: {
      loadData () {
        this.callElasticsearch(this.method, this.methodParams)
          .then(response => {
            this.body = this.flatten ? flattenObject(response, true, true) : response
          })
      }
    }
  }
</script>
