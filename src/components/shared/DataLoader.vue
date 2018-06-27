<template>
  <div>
    <template v-if="renderContentWhileLoading">
      <slot :body="body" :loading="loading">No data</slot>
    </template>

    <template v-else>
      <slot name="error" v-if="hasError" :errorMessage="errorMessage">
        <div class="pa-3">
          <v-alert :value="true">{{errorMessage}}</v-alert>
        </div>
      </slot>
      <slot name="progress" v-else-if="loading">
        <v-progress-linear color="blue" indeterminate></v-progress-linear>
      </slot>
      <slot v-else :body="body">No data</slot>
    </template>
  </div>
</template>

<script>
  import { flattenObject } from '../../helpers/utilities'

  export default {
    name: 'DataLoader',
    data () {
      return {
        body: null,
        loading: false,
        hasError: false,
        errorMessage: ''
      }
    },
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
    methods: {
      loadData () {
        this.loading = true
        this.hasError = false
        this.errorMessage = ''

        this.getElasticsearchAdapter()
          .then(adapter => adapter[this.method](this.methodParams))
          .then(body => {
            this.loading = false
            this.hasError = false
            this.errorMessage = ''
            this.body = this.flatten ? flattenObject(body, true, true) : body
          })
          .catch(error => {
            this.loading = false
            this.hasError = true
            this.errorMessage = error.message
            this.body = ''
            if (error.status === 403) {
              const hint = 'You did not configure your elasticsearch server correctly. ' +
                'Please hit the "RESET" button in the footer to see the correct settings.'
              this.showErrorSnackbar({text: 'Error: ' + error.message, additionalText: hint, timeout: 12000})
            } else {
              this.showErrorSnackbar({text: 'Error:', additionalText: error.message})
            }
          })
      }
    },
    created () {
      if (this.execute) this.loadData()
    }
  }
</script>
