<template>
  <v-snackbar :color="color"
              :multi-line="additionalText !== undefined"
              :timeout="timeout"
              v-model="visible"
              right>
    <strong>{{ text }}</strong>
    <template v-if="additionalText">
      <p class="mb-0">
        {{ additionalText }}
      </p>
      <div v-if="color === 'red'" class="mt-2">
        <v-btn color="" @click.native="copy">Copy error</v-btn>
        <input ref="copyTextArea" :value="additionalText" type="text" style="width:1px">
      </div>
    </template>
  </v-snackbar>
</template>

<script>
  import { mapVuexAccessors } from '@/helpers/store'
  import { mapState } from 'vuex'

  export default {
    name: 'Snackbar',
    computed: {
      ...mapVuexAccessors('snackbar', ['visible']),
      ...mapState('snackbar', ['text', 'additionalText', 'timeout', 'color'])
    },
    methods: {
      copy () {
        const textarea = this.$refs.copyTextArea
        textarea.select()
        textarea.setSelectionRange(0, 99999)
        document.execCommand('copy')
        this.visible = false
      }
    }
  }
</script>
