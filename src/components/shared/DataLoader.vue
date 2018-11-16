<template>
  <div>
    <template v-if="hasError">
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
        <slot :body="body" :loading="loading">No data</slot>
      </template>
      <slot v-else-if="loading" name="progress">
        <v-progress-linear color="blue" indeterminate/>
      </slot>
      <slot v-else :body="body">No data</slot>
    </template>
  </div>
</template>

<script>
  import { flattenObject } from '../../helpers/utilities'

  export default {
    name: 'DataLoader',
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
    data () {
      return {
        body: null,
        loading: false,
        networkError: false,
        apiError: false,
        apiErrorMessage: ''
      }
    },
    computed: {
      hasError () {
        return this.networkError || this.apiError
      }
    },
    created () {
      if (this.execute) this.loadData()
    },
    methods: {
      async loadData () {
        this.loading = true
        this.networkError = false
        this.apiError = false
        this.apiErrorMessage = ''

        try {
          const adapter = await this.getElasticsearchAdapter()
          await adapter.ping()

          try {
            const body = await adapter[this.method](this.methodParams)
            this.networkError = false
            this.apiError = false
            this.apiErrorMessage = ''
            this.body = this.flatten ? flattenObject(body, true, true) : body
          } catch (error) {
            // should be an api error
            this.apiError = true
            this.apiErrorMessage = error.message
            this.body = ''
            this.showErrorSnackbar({ text: 'Error:', additionalText: error.message })
          }
        } catch (error) {
          // at this point we assume some kind of network error
          this.networkError = true
        }
        this.loading = false
      }
    }
  }
</script>
