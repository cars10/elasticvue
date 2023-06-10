<template>
  <div class="inline-block timer" :title="t('shared.timer.settings.title')">
    <q-select v-model="timer" :options="timerSettings" hide-hint borderless dense options-dense>
      <template #selected>
        <span v-if="timer?.value">{{ timer?.label }}</span>
      </template>
    </q-select>
  </div>
</template>

<script setup>
  import { onBeforeUnmount, ref, watch } from 'vue'
  import { useTranslation } from '../../composables/i18n'

  const props = defineProps({
    action: {
      type: Function,
      default: () => {
      }
    }
  })
  const t = useTranslation()
  const timerSettings = [
    { label: 'None', value: null },
    { label: '5s', value: 5 },
    { label: '15s', value: 15 },
    { label: '30s', value: 30 },
    { label: '60s', value: 60 }
  ]
  const timer = ref(null)
  let intervalID = null

  const createInterval = () => {
    intervalID = setInterval(() => {
      props.action.call()
    }, timer.value.value * 1000)
  }
  const destroyInterval = () => {
    clearInterval(intervalID)
    intervalID = null
  }

  watch(timer, newValue => {
    destroyInterval()
    if (newValue.value) createInterval()
  })

  onBeforeUnmount(destroyInterval)
</script>
