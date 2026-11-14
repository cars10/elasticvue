<template>
  <div class="row items-center q-gutter-xs q-mt-sm" data-testid="search-filters">
    <q-chip
      v-for="(filter, index) in filters"
      :key="`${index}-${filterLabel(filter)}`"
      dense
      removable
      clickable
      :outline="filter.disabled"
      :color="filter.negate ? 'negative' : 'primary-dark'"
      text-color="white"
      class="font-mono font-13"
      :class="{ 'text-strike': filter.disabled }"
      data-testid="search-filter-chip"
      @remove="remove(index)"
    >
      {{ filterLabel(filter) }}
      <q-menu ref="chipMenus" anchor="bottom left" self="top left">
        <q-list dense>
          <q-item
            v-close-popup
            clickable
            data-testid="search-filter-toggle"
            @click="update(index, { disabled: !filter.disabled })"
          >
            <q-item-section>{{ filter.disabled ? t('search.filters.enable') : t('search.filters.disable') }}</q-item-section>
          </q-item>
          <q-item v-close-popup clickable data-testid="search-filter-invert" @click="update(index, { negate: !filter.negate })">
            <q-item-section>{{ filter.negate ? t('search.filters.include') : t('search.filters.exclude') }}</q-item-section>
          </q-item>
          <q-item clickable data-testid="search-filter-edit">
            <q-item-section>{{ t('search.filters.edit') }}</q-item-section>
            <q-menu anchor="top right" self="top left">
              <search-filter-form
                :initial="filter"
                :fields="fields"
                :load-values="loadValues"
                @save="(edited) => replace(index, edited)"
              />
            </q-menu>
          </q-item>
        </q-list>
      </q-menu>
    </q-chip>

    <q-btn flat dense no-caps size="sm" icon="add" :label="t('search.filters.add')" data-testid="search-filter-add">
      <q-menu ref="addMenu" anchor="bottom left" self="top left">
        <search-filter-form :fields="fields" :load-values="loadValues" @save="add" />
      </q-menu>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QMenu } from 'quasar'
import SearchFilterForm from './SearchFilterForm.vue'
import { useTranslation } from '../../composables/i18n.ts'
import { filterLabel } from '../../helpers/search/filters.ts'
import type { SearchFilter } from '../../types/search.ts'

defineProps<{ fields: string[]; loadValues: (field: string) => Promise<string[]> }>()
const filters = defineModel<SearchFilter[]>({ required: true })
const t = useTranslation()

const addMenu = ref<QMenu | null>(null)
const chipMenus = ref<QMenu[]>([])

const add = (filter: SearchFilter) => {
  filters.value = [...filters.value, filter]
  addMenu.value?.hide()
}

const replace = (index: number, filter: SearchFilter) => {
  filters.value = filters.value.map((current, i) => (i === index ? filter : current))
  chipMenus.value.forEach((menu) => menu.hide())
}

const update = (index: number, changes: Partial<SearchFilter>) => replace(index, { ...filters.value[index], ...changes })

const remove = (index: number) => (filters.value = filters.value.filter((_, i) => i !== index))
</script>
