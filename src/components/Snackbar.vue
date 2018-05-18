<template>
  <v-snackbar :timeout="timeout"
              :color="color"
              v-model="visible"
              right
              auto-height
              :multi-line="additionalText !== undefined">
    {{text}}
    <template v-if="additionalText">
      <br/>
      {{additionalText}}
    </template>
    <v-btn flat @click.native="visible = false">Close</v-btn>
  </v-snackbar>
</template>

<script>
  export default {
    name: 'Snackbar',
    computed: {
      text: {
        get () {
          return this.$store.state.snackbar.text
        }
      },
      additionalText: {
        get () {
          return this.$store.state.snackbar.additionalText
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
