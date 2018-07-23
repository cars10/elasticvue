<template>
  <v-list-tile>
    <v-list-tile-content>{{text}}</v-list-tile-content>
    <v-list-tile-action>
      <v-btn :loading="loading" :color="color" @click.native="confirmMethod">Run</v-btn>
    </v-list-tile-action>
  </v-list-tile>
</template>

<script>
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
          return {}
        },
        type: [Object, Function]
      },
      confirmMessage: {
        default: '',
        type: String
      }
    },
    data () {
      return {
        loading: false,
        error: false
      }
    },
    computed: {
      color () {
        return this.error ? 'error' : 'primary'
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
