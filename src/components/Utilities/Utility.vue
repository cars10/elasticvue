<template>
  <v-list-item>
    <v-list-item-content>{{text}}</v-list-item-content>
    <v-list-item-action>
      <v-btn :color="color" :id="name" :loading="loading" @click.native="confirmMethod">Run</v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script>
  import { showErrorSnackbar, showSuccessSnackbar } from '@/mixins/ShowSnackbar'
  import esAdapter from '@/mixins/GetAdapter'

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
        esAdapter()
          .then(adapter => adapter[this.method](this.methodParams))
          .then(body => {
            this.loading = false
            this.error = false
            showSuccessSnackbar({ text: 'Success', additionalText: JSON.stringify(body) })
          })
          .catch(error => {
            this.loading = false
            this.error = true
            showErrorSnackbar({ text: 'Error', additionalText: JSON.stringify(error) })
          })
      }
    }
  }
</script>
