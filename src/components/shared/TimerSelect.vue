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

const props = defineProps<{ action: any; modelValue?: number | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: number | null] }>()
const t = useTranslation()
const timerSettings: Timer[] = [
  { label: 'None', value: null },
  { label: '1s', value: 1 },
  { label: '5s', value: 5 },
  { label: '15s', value: 15 },
  { label: '30s', value: 30 },
  { label: '60s', value: 60 }
]

type Timer = {
  label: string
  value: number | null
}
const timer: Ref<Timer | null> = ref(timerSettings.find((t) => t.value === props.modelValue) || null)
let intervalID: number

const createInterval = () => {
  if (!timer.value?.value) return
  intervalID = window.setInterval(() => {
    props.action.call()
  }, timer.value.value * 1000)
}
const destroyInterval = () => {
  clearInterval(intervalID)
}

watch(
  timer,
  (newValue) => {
    destroyInterval()
    emit('update:modelValue', newValue?.value ?? null)
    if (newValue?.value) createInterval()
  },
  { immediate: true }
)

watch(
  () => props.modelValue,
  (newValue) => {
    const found = timerSettings.find((t) => t.value === newValue)
    if (found && timer.value?.value !== found.value) {
      timer.value = found
    }
  },
  { immediate: true }
)

onBeforeUnmount(destroyInterval)
</script>
