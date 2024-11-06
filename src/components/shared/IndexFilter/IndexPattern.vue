<template>
  <q-input v-model="localValue"
           outlined
           bottom-slots
           :label="t('shared.index_filter.index_pattern.input.label')"
           :loading="requestState.loading"
           autocomplete="off"
           @keydown.esc="localValue = '*'">
    <template #hint>
      <div>
        <q-btn :label="hint" flat class="q-py-none q-px-xs" size="sm" no-caps
               :color="indexNames.length === 0 ? 'warning' : ''">
          <q-menu>
            <div class="q-pa-sm">
              <div v-for="index in indexNames" :key="index as string">
                <span class="font-13">{{ index }}</span>
              </div>
            </div>
          </q-menu>
        </q-btn>
      </div>
    </template>
  </q-input>
</template>

<script setup lang="ts">
  import { Ref, computed, onMounted, ref, watch } from 'vue'
  import { useTranslation } from '../../../composables/i18n'
  import { useElasticsearchAdapter } from '../../../composables/CallElasticsearch'
  import { EsIndex } from '../../../composables/components/indices/IndicesTable.ts'

  const t = useTranslation()

  const props = defineProps<{ modelValue: string }>()
  const emit = defineEmits(['update:modelValue'])
  const indices: Ref<EsIndex[]> = ref([])
  const localValue = ref(props.modelValue)

  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const load = () => {
    return callElasticsearch('catIndices', { index: localValue.value, h: 'index' })
      .then(body => (indices.value = body))
      .catch(() => (indices.value = []))
  }
  onMounted(load)

  watch(localValue, v => {
    emit('update:modelValue', v)
    load()
  })

  const indexNames = computed(() => (indices.value.map(i => (i.index || i))).sort())
  const hint = computed(() => t('shared.index_filter.index_pattern.matched_indices', { count: indices.value.length }))
</script>