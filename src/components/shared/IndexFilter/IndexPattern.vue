<template>
  <q-input v-model="localValue"
           outlined
           bottom-slots
           :label="$t('shared.index_filter.index_pattern.input.label')"
           :loading="loading"
           autocomplete="off">
    <template #hint>
      <div>
        <q-btn :label="hint" flat class="q-py-none q-px-xs" size="sm" no-caps>
          <q-menu>
            <q-list dense>
              <q-item v-for="index in indexNames" :key="index">
                <q-item-section class="font-13">{{ index }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </template>
  </q-input>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useTranslation } from '../../../composables/i18n'

  const t = useTranslation()

  const props = defineProps<{ modelValue: string, indexNames: string[], loading: boolean }>()
  const emit = defineEmits(['update:modelValue'])

  const localValue = ref(props.modelValue)
  watch(localValue, v => emit('update:modelValue', v))

  const hint = computed(() => t('shared.index_filter.index_pattern.matched_indices', { count: props.indexNames.length }))
</script>