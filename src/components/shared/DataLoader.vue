<template>
  <div>
    <slot name="error" v-if="hasError" :errorMessage="errorMessage">
      <div class="pa-3">
        <v-alert :value="true">{{errorMessage}}</v-alert>
      </div>
    </slot>
    <slot name="progress" v-else-if="loading">
      <v-progress-linear color="blue" indeterminate></v-progress-linear>
    </slot>
    <slot v-else :body="responseBody">No data</slot>
  </div>
</template>

<script>
  import { flattenObject } from '../../helpers/utilities'

  export default {
    props: {
      method: {
        type: String,
        default: ''
      },
      methodParams: {
        default: () => {
        }
      },
      flatten: Boolean
    },
    data () {
      return {
        responseBody: null,
        loading: false,
        hasError: false,
        errorMessage: ''
      }
    },
    methods: {
      loadData () {
        this.loading = true
        this.hasError = false
        this.errorMessage = ''

        this.getElasticsearchAdapter().then(adapter => adapter[this.method](this.methodParams)).then(
          body => {
            this.loading = false
            this.hasError = false
            this.errorMessage = ''
            this.responseBody = this.flatten ? flattenObject(body, true, true) : body
          }
        ).catch(error => {
          this.loading = false
          this.hasError = true
          this.errorMessage = error.message
          this.responseBody = ''
          this.showErrorSnackbar({text: 'Error:', additionalText: error.message})
        })
      }
    },
    created () {
      this.loadData()
    }
  }
</script>
