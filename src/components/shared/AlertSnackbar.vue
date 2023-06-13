<template>
  <q-card v-if="store.visible" class="snackbar" @mouseover="setHover" @mouseleave="unsetHover">
    <div :class="`border-none border-${store.color} q-pa-md border-l-8`">
      <strong class="q-mb-md inline-block">{{ store.title }}</strong>
      <template v-if="store.body">
        <div class="q-my-sm overflow-auto" style="max-height: 200px">
          <p>{{ store.body }}</p>
        </div>
        <q-btn :label="t('defaults.close')" color="dark-grey" @click="close" />
        <copy-button v-if="store.copyableText && store.copyableText.length > 0" :value="store.copyableText"
                     title="Copy response"
                     class="float-right" />
      </template>
      <div v-else class="overflow-auto">
        <q-btn :label="t('defaults.close')" color="dark-grey" @click="close" />
      </div>

      <div class="snackbar--progress-bar" :style="progressBarStyle" />
    </div>
  </q-card>
</template>

<script setup>
  import CopyButton from './CopyButton.vue'
  import { useSnackbarStore } from '../../store/snackbar'
  import { computed, ref, watch } from 'vue'
  import { useTranslation } from '../../composables/i18n'

  const t = useTranslation()
  const store = useSnackbarStore()

  const progressBarHeight = ref(100)
  let closeTimer
  let progressBarInterval

  const setTimer = () => {
    clearTimeout(closeTimer)
    clearInterval(progressBarInterval)
    progressBarHeight.value = 100

    if (!store.visible || store.timeout <= 0) return

    closeTimer = startCloseTimer(store.timeout)
    progressBarInterval = startProgressInterval(store.timeout)
  }

  watch(() => store.visible, setTimer)
  watch(() => store.id, setTimer)

  const startCloseTimer = timeout => {
    return setTimeout(() => {
      store.visible = false
      progressBarHeight.value = 100
    }, timeout)
  }

  const startProgressInterval = timeLeft => {
    return setInterval(() => {
      if (timeLeft > 0) {
        timeLeft -= 100
        progressBarHeight.value = (timeLeft / store.timeout) * 100
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

    const timeLeft = store.timeout * (progressBarHeight.value / 100)
    progressBarInterval = startProgressInterval(timeLeft)
    closeTimer = startCloseTimer(timeLeft)
  }

  const close = () => {
    hover = false
    store.visible = false
    progressBarHeight.value = 100
    clearTimeout(closeTimer)
    clearInterval(progressBarInterval)
  }
</script>
