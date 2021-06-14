<template>
  <v-snackbar v-model="visible"
              :color="color"
              :multi-line="additionalText !== undefined"
              :timeout="timeout"
              right
              style="overflow-wrap: anywhere">
    <strong>{{ text }}</strong>
    <template v-if="additionalText">
      <div class="my-2 overflow-y-auto" style="max-height: 300px">
        <p>
          {{ additionalText }}
        </p>
      </div>
      <v-btn class="mr-4" @click.native="copy">Copy</v-btn>
      <v-btn @click.native="visible = false">Close</v-btn>
    </template>
  </v-snackbar>
</template>

<script>
  import { vuexAccessors } from '@/helpers/store'

  export default {
    name: 'snackbar',
    setup () {
      const {
        text,
        additionalText,
        timeout,
        color,
        visible
      } = vuexAccessors('snackbar', ['text', 'additionalText', 'timeout', 'color', 'visible'])

      const copy = () => {
        navigator.clipboard.writeText(additionalText.value)
      }

      return {
        visible,
        text,
        additionalText,
        timeout,
        color,
        copy
      }
    }
  }
</script>
