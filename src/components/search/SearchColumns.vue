<template>
  <q-btn
    flat
    no-caps
    icon="view_column"
    :label="t('search.results_table.columns.button', { count: modelValue.length })"
    data-testid="search-columns"
  >
    <q-menu anchor="bottom right" self="top right" @before-show="filter = ''">
      <div class="column no-wrap" style="width: 340px; max-height: 70vh">
        <div class="row no-wrap items-center q-pa-sm q-gutter-x-xs">
          <filter-input v-model="filter" class="col" data-testid="search-columns-filter" />
          <q-btn
            flat
            dense
            no-caps
            :label="t('search.results_table.columns.all')"
            data-testid="search-columns-all"
            @click="selectAll"
          />
          <q-btn
            flat
            dense
            no-caps
            :label="t('search.results_table.columns.none')"
            data-testid="search-columns-none"
            @click="emit('update:modelValue', [])"
          />
          <q-btn
            flat
            dense
            no-caps
            :label="t('search.results_table.columns.reset')"
            data-testid="search-columns-reset"
            @click="emit('reset')"
          />
        </div>
        <q-separator />

        <div v-if="catalogSkipped" class="text-muted font-13 q-pa-sm" data-testid="search-columns-skipped">
          {{ t('search.results_table.columns.catalog_skipped', { limit: FIELD_CATALOG_INDEX_LIMIT }) }}
        </div>

        <q-list dense class="col scroll" data-testid="search-columns-list">
          <template v-for="group in groups" :key="group.name">
            <q-item-label header class="q-py-sm">{{ group.label }}</q-item-label>
            <q-item v-for="option in group.options" :key="option.name" tag="label" dense data-testid="search-column-option">
              <q-item-section side>
                <q-checkbox
                  :model-value="modelValue.includes(option.name)"
                  size="32px"
                  dense
                  @update:model-value="toggle(option.name)"
                />
              </q-item-section>
              <q-item-section class="font-mono font-13 ellipsis">{{ labelFor(option.name) }}</q-item-section>
              <q-item-section v-if="option.indices" side class="text-muted font-13">
                {{ t('search.results_table.columns.in_indices', { count: option.indices }, option.indices) }}
              </q-item-section>
            </q-item>
          </template>
          <q-item v-if="truncated" class="text-muted font-13">{{ t('search.results_table.columns.refine') }}</q-item>
        </q-list>
      </div>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import FilterInput from '../shared/FilterInput.vue'
import { useTranslation } from '../../composables/i18n.ts'
import { matchesAllTerms } from '../../helpers/filters.ts'
import { ColumnGroup, ColumnOption, SOURCE_COLUMN } from '../../helpers/search/columns.ts'
import { FIELD_CATALOG_INDEX_LIMIT } from '../../composables/components/search/FieldCatalog.ts'

const LIMIT = 300

const props = defineProps<{ modelValue: string[]; options: ColumnOption[]; catalogSkipped: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [columns: string[]]; reset: [] }>()

const t = useTranslation()
const filter = ref('')

const groupLabels: Record<ColumnGroup, string> = {
  meta: t('search.results_table.columns.groups.meta'),
  all: t('search.results_table.columns.groups.all'),
  some: t('search.results_table.columns.groups.some'),
  unmapped: t('search.results_table.columns.groups.unmapped')
}

const labelFor = (name: string) => (name === SOURCE_COLUMN ? t('search.results_table.document') : name)

const matching = computed(() => props.options.filter((option) => matchesAllTerms(labelFor(option.name), filter.value)))
const truncated = computed(() => matching.value.length > LIMIT)

const groups = computed(() =>
  (Object.keys(groupLabels) as ColumnGroup[])
    .map((name) => ({
      name,
      label: groupLabels[name],
      options: matching.value.slice(0, LIMIT).filter((option) => option.group === name)
    }))
    .filter((group) => group.options.length > 0)
)

const toggle = (name: string) => {
  const columns = props.modelValue.includes(name)
    ? props.modelValue.filter((column) => column !== name)
    : [...props.modelValue, name]
  emit('update:modelValue', columns)
}

const selectAll = () => {
  const added = matching.value.map((option) => option.name).filter((name) => !props.modelValue.includes(name))
  emit('update:modelValue', [...props.modelValue, ...added])
}
</script>
