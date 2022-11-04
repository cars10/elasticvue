<template>
  <v-card v-if="visible" class="snackbar" @mouseover="setHover" @mouseleave="unsetHover">
    <div class="pa-3 border--left--8" :class="`border--${color}`">
      <strong>{{ title }}</strong>
      <template v-if="body">
        <div class="my-2 overflow-y-auto" style="max-height: 200px">
          <p>{{ body }}</p>
        </div>
        <v-btn @click.native="close">{{ $t('defaults.close') }}</v-btn>
        <copy-button :value="copyableText" v-if="copyableText && copyableText.length > 0" title="Copy response"
                     class="float-right"/>
      </template>
      <div v-else class="my-2 overflow-y-auto">
        <v-btn @click.native="close">{{ $t('defaults.close') }}</v-btn>
      </div>

      <div class="snackbar--progress-bar" :style="progressBarStyle"></div>
    </div>
  </v-card>
</template>

<script>
  import { computed, ref, watch } from 'vue'
  import { vuexAccessors } from '@/helpers/store'
  import CopyButton from '@/components/shared/CopyButton'

  export default {
    name: 'snackbar',
    components: {
      CopyButton
    },
    setup () {
      const {
        title,
        body,
        timeout,
        color,
        visible,
        copyableText
      } = vuexAccessors('snackbar', ['title', 'body', 'timeout', 'color', 'visible', 'copyableText'])

      const progressBarHeight = ref(100)
      let closeTimer
      let progressBarInterval

      const setTimer = () => {
        clearTimeout(closeTimer)
        clearInterval(progressBarInterval)
        progressBarHeight.value = 100

        if (!visible.value || timeout.value <= 0) return

        closeTimer = startCloseTimer(timeout.value)
        progressBarInterval = startProgressInterval(timeout.value)
      }

      watch(visible, setTimer)
      watch(timeout, setTimer)

      const startCloseTimer = timeout => {
        return setTimeout(() => {
          visible.value = false
          progressBarHeight.value = 100
        }, timeout)
      }

      const startProgressInterval = timeLeft => {
        return setInterval(() => {
          if (timeLeft > 0) {
            timeLeft -= 100
            progressBarHeight.value = (timeLeft / timeout.value) * 100
          } else {
            clearInterval(progressBarInterval)
          }
        }, 100)
      }

      const progressBarStyle = computed(() => (`height: ${progressBarHeight.value}%`))

      let hover = false
      const setHover = () => {
        if (hover) return
        hover = true

        clearTimeout(closeTimer)
        clearInterval(progressBarInterval)
      }

      const unsetHover = () => {
        if (!hover) return
        hover = false

        const timeLeft = timeout.value * (progressBarHeight.value / 100)
        progressBarInterval = startProgressInterval(timeLeft)
        closeTimer = startCloseTimer(timeLeft)
      }

      const close = () => {
        hover = false
        visible.value = false
        progressBarHeight.value = 100
        clearTimeout(closeTimer)
        clearInterval(progressBarInterval)
      }

      return {
        visible,
        title,
        body,
        color,
        copyableText,
        close,
        progressBarHeight,
        progressBarStyle,
        setHover,
        unsetHover
      }
    }
  }
</script>
