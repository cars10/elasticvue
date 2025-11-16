<template>
  <div class="reload-button">
    <div class="flex items-center">
      <q-btn :title="t('shared.reload_button.reload')" class="mr-0" round flat dense size="13px" icon="cached" @click="action" />
      <timer-select :action="action" v-model="ownValue" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTranslation } from '../../composables/i18n'
import TimerSelect from './TimerSelect.vue'

const t = useTranslation()

const props = defineProps<{ action: any; modelValue?: number | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: number | null] }>()

const ownValue = ref(props.modelValue ?? null)
watch(ownValue, (value) => emit('update:modelValue', value ?? null))
</script>
