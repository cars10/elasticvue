<template>
  <div class="reload-button">
    <div class="reload-button__group">
      <q-btn flat dense class="reload-button__refresh" :title="t('shared.reload_button.reload')" @click="refresh">
        <span class="reload-button__glyph">
          <svg v-if="ownValue" class="reload-button__ring" viewBox="0 0 22 22" aria-hidden="true">
            <circle class="reload-button__ring-track" cx="11" cy="11" r="8" />
            <circle
              :key="cycle"
              class="reload-button__ring-value"
              cx="11"
              cy="11"
              r="8"
              :style="{ animationDuration: `${ownValue}s` }"
            />
          </svg>
          <q-icon name="sync" size="16px" class="reload-button__sync" :class="{ 'is-spinning': spinning }" />
        </span>
      </q-btn>
      <timer-select ref="intervalPicker" :action="action" v-model="ownValue" @cycle="cycle += 1" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { useTranslation } from '../../composables/i18n'
import TimerSelect from './TimerSelect.vue'

const t = useTranslation()

const props = defineProps<{ action: any; modelValue?: number | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: number | null] }>()

const intervalPicker = ref<{ restart: () => void } | null>(null)
const ownValue = ref(props.modelValue ?? null)
const cycle = ref(0)
const spinning = ref(false)

watch(ownValue, (value) => {
  emit('update:modelValue', value ?? null)
  cycle.value += 1
})
let spinTimeout = 0

const spin = () => {
  spinning.value = false
  window.clearTimeout(spinTimeout)
  window.setTimeout(() => {
    spinning.value = true
    spinTimeout = window.setTimeout(() => {
      spinning.value = false
    }, 450)
  })
}

const refresh = () => {
  props.action()
  intervalPicker.value?.restart()
  spin()
}

onBeforeUnmount(() => window.clearTimeout(spinTimeout))
</script>
