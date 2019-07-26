<template>
  <v-snackbar :color="color"
              :multi-line="additionalText !== undefined"
              :timeout="timeout"
              v-model="visible"
              right>
    {{text}}
    <template v-if="additionalText">
      <br>
      {{additionalText}}
    </template>
    <v-btn text @click.native="visible = false">Close</v-btn>
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
