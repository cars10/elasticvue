<template>
  <div>
    <div v-if="showSelect" class="relative-position">
      <div class="absolute inline-block" style="z-index: 10; top: -1px; right: 0">
        <q-btn class="btn-link q-px-xs q-py-none" flat :label="t('shared.index_filter.use_index_pattern')"
               no-caps @click="toggle" />
      </div>
      <index-select v-model="localIndices"
                    behavior="load"
                    method="catIndices"
                    :method-params="{ index: '*', h: 'index' }" />
    </div>

    <div v-else class="relative-position">
      <div class="absolute inline-block" style="z-index: 10; top: -1px; right: 0">
        <q-btn class="btn-link q-px-xs q-py-none" flat :label="t('shared.index_filter.use_index_select')"
               no-caps @click="toggle" />
      </div>
      <index-pattern v-model="localPattern" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import IndexPattern from './IndexFilter/IndexPattern.vue'
  import IndexSelect from './IndexFilter/IndexSelect.vue'
  import { useTranslation } from '../../composables/i18n.ts'

  const props = defineProps<{ modelValue: any }>()
  const emit = defineEmits(['update:modelValue'])
  const t = useTranslation()
  const localIndices = Array.isArray(props.modelValue) ? ref(props.modelValue) : ref([])
  const localPattern = typeof props.modelValue === 'string' ? ref(props.modelValue) : ref('*')

  const showSelect = ref(typeof props.modelValue !== 'string')
  const toggle = () => (showSelect.value = !showSelect.value)

  watch(localIndices, newValue => emit('update:modelValue', newValue))
  watch(localPattern, newValue => emit('update:modelValue', newValue))
</script>
