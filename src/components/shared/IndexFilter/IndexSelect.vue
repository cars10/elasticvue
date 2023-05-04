<template>
  <q-select v-model="localValue"
            class="full-width"
            :options="options"
            use-input
            options-dense
            input-debounce="0"
            multiple
            :loading="loading"
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
        {{ localValue.length }} {{ $t('shared.index_filter.index_select.indices_selected') }}
      </template>
      <template v-else-if="localValue.length > 0">
        {{ localValue.join(', ') }}
      </template>
    </template>
  </q-select>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useTranslation } from '../../../composables/i18n'

  const t = useTranslation()

  const props = defineProps<{ modelValue: string[], indexNames: string[], loading: boolean }>()
  const emit = defineEmits(['update:modelValue'])

  const localValue = ref(props.modelValue)
  watch(localValue, v => emit('update:modelValue', v))
  const options = ref(props.indexNames)

  const filter = (val, update) => {
    if (val.length === 0) {
      update(() => (options.value = props.indexNames))
      return
    }

    update(() => {
      const search = val.toLowerCase()
      options.value = props.indexNames.filter(v => v.includes(search))
    })
  }
</script>
