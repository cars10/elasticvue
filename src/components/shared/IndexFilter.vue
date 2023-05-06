<template>
  <div class="q-mt-lg">
    <div v-if="showSelect" class="relative-position">
      <div class="absolute-right" style="z-index: 10; top: -4px">
        <q-btn class="btn-link q-px-xs q-py-none" flat :label="$t('shared.index_filter.use_index_pattern')"
               no-caps @click="toggle" />
      </div>
      <index-select v-model="localIndices" :index-names="indexNames" :loading="requestState.loading" />
    </div>

    <div v-else class="relative-position">
      <div class="absolute-right" style="z-index: 10; top: -4px">
        <q-btn class="btn-link q-px-xs q-py-none" flat :label="$t('shared.index_filter.use_index_select')"
               no-caps @click="toggle" />
      </div>
      <index-pattern v-model="localPattern" :index-names="indexNames" :loading="requestState.loading" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, onMounted, ref, watch } from 'vue'
  import { ElasticsearchMethod } from '../../services/ElasticsearchAdapter'
  import IndexPattern from './IndexFilter/IndexPattern.vue'
  import IndexSelect from './IndexFilter/IndexSelect.vue'
  import { useElasticsearchAdapter } from '../../composables/CallElasticsearch'

  const props = defineProps<{ method: ElasticsearchMethod, methodParams: any, modelValue: any }>()
  const emit = defineEmits(['update:modelValue'])

  const localIndices = Array.isArray(props.modelValue) ? ref(props.modelValue) : ref([])
  const localPattern = typeof props.modelValue === 'string' ? ref(props.modelValue) : ref('*')

  const showSelect = ref(typeof props.modelValue !== 'string')
  const toggle = () => (showSelect.value = !showSelect.value)

  const indices = ref([])
  const indexNames = computed(() => (indices.value.map(i => i.index)).sort())

  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const load = () => {
    return callElasticsearch(props.method, props.methodParams)
        .then(body => (indices.value = body))
        .catch(() => (indices.value = []))
  }
  onMounted(load)

  // select
  watch(localIndices, newValue => emit('update:modelValue', newValue))

  // pattern
  watch(localPattern, newValue => {
    emit('update:modelValue', newValue)
    nextTick(() => {
      load()
    })
  })
</script>
