<template>
  <q-form class="column q-gutter-y-sm q-pa-md" style="width: 320px" data-testid="search-filter-form" @submit.prevent="save">
    <q-select
      v-model="filter.field"
      :options="fieldOptions"
      use-input
      fill-input
      hide-selected
      input-debounce="0"
      dense
      outlined
      options-dense
      :label="t('search.filters.field')"
      data-testid="search-filter-field"
      @filter="filterFields"
      @update:model-value="loadSuggestions"
    />

    <q-btn-toggle
      v-model="filter.op"
      :options="opOptions"
      no-caps
      unelevated
      dense
      spread
      toggle-color="primary-dark"
      color="dark-grey"
      data-testid="search-filter-op"
    />

    <q-select
      v-if="filter.op === 'is'"
      :model-value="filter.value"
      :options="valueOptions"
      use-input
      fill-input
      hide-selected
      input-debounce="0"
      dense
      outlined
      options-dense
      :label="t('search.filters.value')"
      data-testid="search-filter-value"
      @filter="filterValues"
      @input-value="(value: string) => (filter.value = value)"
      @update:model-value="(value: string) => (filter.value = value)"
    />

    <div v-if="filter.op === 'between'" class="row q-col-gutter-sm">
      <div class="col">
        <q-input v-model="filter.value" dense outlined :label="t('search.filters.from')" data-testid="search-filter-from" />
      </div>
      <div class="col">
        <q-input v-model="filter.to" dense outlined :label="t('search.filters.to')" data-testid="search-filter-to" />
      </div>
    </div>

    <q-checkbox v-model="filter.negate" dense :label="t('search.filters.negate')" data-testid="search-filter-negate" />

    <div class="row justify-end q-gutter-x-sm">
      <q-btn v-close-popup flat no-caps :label="t('defaults.cancel')" />
      <q-btn
        type="submit"
        unelevated
        no-caps
        color="primary-dark"
        :disable="!isCompleteFilter(filter)"
        :label="t('search.filters.save')"
        data-testid="search-filter-save"
      />
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'
import { matchesAllTerms } from '../../helpers/filters.ts'
import { isCompleteFilter } from '../../helpers/search/filters.ts'
import type { SearchFilter } from '../../types/search.ts'

const props = defineProps<{ initial?: SearchFilter; fields: string[]; loadValues: (field: string) => Promise<string[]> }>()
const emit = defineEmits<{ save: [filter: SearchFilter] }>()
const t = useTranslation()

const filter = reactive<SearchFilter>({ field: '', op: 'is', value: '', ...props.initial })
const fieldOptions = ref<string[]>([])
const suggestions = ref<string[]>([])
const valueOptions = ref<string[]>([])

const opOptions = [
  { label: t('search.filters.ops.is'), value: 'is' },
  { label: t('search.filters.ops.exists'), value: 'exists' },
  { label: t('search.filters.ops.between'), value: 'between' }
]

const filterFields = (query: string, update: (fn: () => void) => void) =>
  update(() => (fieldOptions.value = props.fields.filter((field) => matchesAllTerms(field, query)).slice(0, 50)))

const filterValues = (query: string, update: (fn: () => void) => void) =>
  update(() => (valueOptions.value = suggestions.value.filter((value) => matchesAllTerms(value, query))))

const loadSuggestions = async () => {
  suggestions.value = filter.field ? await props.loadValues(filter.field) : []
  valueOptions.value = suggestions.value
}

onMounted(loadSuggestions)

const save = () => {
  if (!isCompleteFilter(filter)) return
  const { field, op, value, to, negate, disabled } = filter
  emit('save', {
    field,
    op,
    ...(op === 'is' && { value }),
    ...(op === 'between' && { value: value || undefined, to: to || undefined }),
    ...(negate && { negate }),
    ...(disabled && { disabled })
  })
}
</script>
