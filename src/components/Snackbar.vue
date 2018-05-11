<template>
  <v-snackbar :timeout="timeout" v-model="visible" :color="color" right>
    {{text}}
    <v-btn flat @click.native="visible = false">Close</v-btn>
  </v-snackbar>
</template>

<script>
  export default {
    computed: {
      text: {
        get () {
          return this.$store.state.snackbar.text
        }
      },
      timeout: {
        get () {
          return this.$store.state.snackbar.timeout
        }
      },
      color: {
        get () {
          return this.$store.state.snackbar.color
        }
      },
      visible: {
        get () {
          return this.$store.state.snackbar.visible
        },
        set (visible) {
          this.$store.commit('setSnackbarVisible', visible)
        }
      }
    }
  }
</script>
