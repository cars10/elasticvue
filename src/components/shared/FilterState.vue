<template>
  <div v-if="filter" class="flex items-center">
    <q-chip v-model="chip"
            color="primary-dark"
            text-color="white"
            clickable
            removable
            @click="filter = ''"
            @remove="filter = ''">
      <span class="q-pr-sm">Filter: '{{ filter }}'</span>
    </q-chip>

    <div class="q-mx-sm font-14">Matches {{ filteredResultsCount }} / {{ resultsCount }} results</div>
  </div>
</template>

<script setup lang="ts">
  import { ComputedRef, ref, watch } from 'vue'

  const props = defineProps<{
    modelValue: string,
    resultsCount: ComputedRef<number>,
    filteredResultsCount: ComputedRef<number>
  }>()
  const emit = defineEmits(['update:modelValue'])

  const filter = ref(props.modelValue)
  const chip = ref(true)

  watch(filter, newValue => {
    emit('update:modelValue', newValue)
    chip.value = newValue?.length > 0
  })
  watch(() => props.modelValue, newValue => (filter.value = newValue))
</script>
