<template>
  <q-select v-model="localValue"
            class="full-width"
            :options="options"
            outlined
            use-input
            options-dense
            input-debounce="0"
            multiple
            :loading="requestState.loading"
            :label="t('shared.index_filter.index_select.select_indices.label')"
            @filter="filter">
    <template #before-options>
      <div class="q-pa-sm">
        <q-btn color="dark-grey q-mr-md"
               :label="t('shared.index_filter.index_select.select_all.text')"
               @click="localValue = options" />
        <q-btn color="dark-grey"
               :label="t('shared.index_filter.index_select.deselect_all.text')"
               @click="localValue= []" />
      </div>
      <q-separator />
    </template>

    <template #selected>
      <template v-if="localValue.length > 3">
        {{ localValue.length }} {{ t('shared.index_filter.index_select.indices_selected') }}
      </template>
      <template v-else-if="localValue.length > 0">
        {{ localValue.join(', ') }}
      </template>
    </template>
  </q-select>
</template>

<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue'
  import { useTranslation } from '../../../composables/i18n'
  import { useElasticsearchAdapter } from '../../../composables/CallElasticsearch'
  import { ElasticsearchMethod } from '../../../services/ElasticsearchAdapter'
  import { EsIndex } from '../../../composables/components/indices/IndicesTable.ts'

  const t = useTranslation()

  type Behavior = 'load' | 'use'
  const props = withDefaults(defineProps<{
    modelValue: string[],
    indexNames?: string[],
    behavior: Behavior,
    method?: ElasticsearchMethod,
    methodParams?: any
  }>(), {
    modelValue: () => ([]),
    indexNames: () => ([]),
    behavior: 'use',
    method: 'catIndices',
    methodParams: null
  })
  const emit = defineEmits(['update:modelValue'])

  const localValue = ref(props.modelValue)
  watch(localValue, v => emit('update:modelValue', v))

  const options = ref(props.behavior === 'use' ? props.indexNames : [])
  const indices = ref([])

  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  if (props.behavior === 'load') {
    const load = () => {
      return callElasticsearch(props.method, props.methodParams)
        .then(body => indices.value = body.map((i: EsIndex) => (i.index || i)).sort())
        .catch(() => (indices.value = []))
    }
    onMounted(load)
  }

  const filter = (val: string, update: any) => {
    const data = props.behavior === 'use' ? props.indexNames : indices.value

    if (val.length === 0) {
      update(() => (options.value = data))
      return
    }

    update(() => {
      const search = val.toLowerCase()
      options.value = data.filter(v => v.includes(search))
    })
  }
</script>
