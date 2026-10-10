<template>
  <q-btn
    flat
    dense
    no-caps
    class="reload-button__interval"
    :class="{ 'is-live': timer.value !== null }"
    :title="t('shared.timer.settings.title')"
  >
    <span class="reload-button__interval-label">{{ label }}</span>
    <q-icon name="arrow_drop_down" size="18px" />
    <q-menu anchor="bottom right" self="top right" :offset="[0, 6]">
      <q-list dense class="reload-button__menu">
        <template v-for="option in timerSettings" :key="String(option.value)">
          <q-item
            v-close-popup
            clickable
            dense
            active-class="reload-button__option--active"
            :active="isSelected(option)"
            @click="timer = option"
          >
            <q-item-section>
              <q-item-label class="reload-button__option">
                <span>{{ optionLabel(option) }}</span>
                <q-icon v-if="isSelected(option)" name="check" size="16px" />
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-separator v-if="option.value == null" />
        </template>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useTranslation } from '../../composables/i18n'

const props = defineProps<{ action: any; modelValue?: number | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: number | null]; cycle: [] }>()
const t = useTranslation()

type Timer = {
  value: number | null
}

const timerSettings: Timer[] = [
  { value: null },
  { value: 1 },
  { value: 2 },
  { value: 3 },
  { value: 5 },
  { value: 15 },
  { value: 30 },
  { value: 60 }
]

const timer = ref<Timer>(timerSettings.find((option) => option.value === props.modelValue) ?? timerSettings[0])
let intervalID = 0

const optionLabel = (option: Timer) => (option.value == null ? t('shared.timer.off') : `${option.value}s`)
const label = computed(() => optionLabel(timer.value))
const isSelected = (option: Timer) => timer.value.value === option.value

const destroyInterval = () => {
  window.clearInterval(intervalID)
}

const createInterval = () => {
  if (!timer.value.value) return
  const seconds = timer.value.value
  intervalID = window.setInterval(() => {
    props.action.call()
    emit('cycle')
  }, seconds * 1000)
}

const restart = () => {
  destroyInterval()
  createInterval()
  if (timer.value.value) emit('cycle')
}

watch(
  timer,
  (newValue) => {
    destroyInterval()
    emit('update:modelValue', newValue.value)
    createInterval()
  },
  { immediate: true }
)

watch(
  () => props.modelValue,
  (newValue) => {
    if (timer.value.value === newValue) return
    const found = timerSettings.find((option) => option.value === newValue)
    if (found) timer.value = found
  }
)

onBeforeUnmount(destroyInterval)
defineExpose({ restart })
</script>
