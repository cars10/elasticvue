<template>
  <div class="inline-block timer" :title="t('shared.timer.settings.title')">
    <q-select v-model="timer" :options="timerSettings" hide-hint borderless dense options-dense>
      <template #selected>
        <span v-if="timer?.value">{{ timer?.label }}</span>
      </template>
    </q-select>
  </div>
</template>

<script setup lang="ts">
  import { onBeforeUnmount, Ref, ref, watch } from 'vue'
  import { useTranslation } from '../../composables/i18n'

  const props = defineProps<{ action: any }>()
  const t = useTranslation()
  const timerSettings = [
    { label: 'None', value: null },
    { label: '1s', value: 1 },
    { label: '5s', value: 5 },
    { label: '15s', value: 15 },
    { label: '30s', value: 30 },
    { label: '60s', value: 60 }
  ]

  type Timer = {
    label: string,
    value: number
  }
  const timer: Ref<Timer | null> = ref(null)
  let intervalID: number

  const createInterval = () => {
    if (!timer.value) return
    intervalID = window.setInterval(() => {
      props.action.call()
    }, timer.value.value * 1000)
  }
  const destroyInterval = () => {
    clearInterval(intervalID)
  }

  watch(timer, newValue => {
    destroyInterval()
    if (newValue?.value) createInterval()
  })

  onBeforeUnmount(destroyInterval)
</script>
