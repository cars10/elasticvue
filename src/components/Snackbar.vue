<template>
  <v-snackbar :timeout="timeout"
              :color="color"
              v-model="visible"
              :multi-line="additionalText !== undefined"
              right
              auto-height>
    {{text}}
    <template v-if="additionalText">
      <br>
      {{additionalText}}
    </template>
    <v-btn flat @click.native="visible = false">Close</v-btn>
  </v-snackbar>
</template>

<script>
  import { mapVuexAccessors } from '../helpers/store'
  import { mapState } from 'vuex'

  export default {
    name: 'Snackbar',
    computed: {
      ...mapVuexAccessors('snackbar', ['visible']),
      ...mapState('snackbar', ['text', 'additionalText', 'timeout', 'color'])
    }
  }
</script>
