<template>
  <v-list-tile>
    <v-list-tile-content>{{text}}</v-list-tile-content>
    <v-list-tile-action>
      <v-btn @click.native="confirmMethod" :loading="loading" :color="color">Run</v-btn>
    </v-list-tile-action>
  </v-list-tile>
</template>

<script>
  export default {
    class: 'Utility',
    data () {
      return {
        loading: false,
        error: false
      }
    },
    props: {
      text: String,
      method: String,
      methodParams: {
        default: undefined
      },
      confirmMessage: String
    },
    computed: {
      color () {
        return this.error ? 'error' : null
      }
    },
    methods: {
      confirmMethod () {
        if (this.confirmMessage) {
          if (confirm(this.confirmMessage)) {
            this.runMethod()
          }
        } else {
          this.runMethod()
        }
      },
      runMethod () {
        this.loading = true
        this.error = false
        this.getElasticsearchAdapter()
          .then(adapter => adapter[this.method](this.methodParams))
          .then(body => {
            this.loading = false
            this.error = false
            this.showSuccessSnackbar({text: 'Success.', additionalText: body})
          })
          .catch(error => {
            this.loading = false
            this.error = true
            this.showErrorSnackbar({text: 'Error.', additionalText: error})
          })
      }
    }
  }
</script>
