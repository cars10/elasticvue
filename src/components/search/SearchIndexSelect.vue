<template>
  <q-select
    ref="select"
    v-model="targets"
    :options="filtered"
    option-value="name"
    option-label="name"
    emit-value
    map-options
    multiple
    use-chips
    use-input
    spellcheck="false"
    autocorrect="off"
    autocapitalize="off"
    hide-dropdown-icon
    new-value-mode="add-unique"
    input-debounce="0"
    outlined
    dense
    options-dense
    bottom-slots
    :label="t('search.form.indices.label')"
    data-testid="search-targets"
    @filter="filter"
    @add="select?.updateInputValue('')"
  >
    <template #selected-item="{ opt, index, removeAtIndex }">
      <q-chip
        dense
        removable
        color="primary-dark"
        text-color="white"
        :icon="chipIcon(optionName(opt))"
        class="font-mono font-13"
        data-testid="search-target-chip"
        @remove="removeAtIndex(index)"
      >
        {{ optionName(opt) }}
      </q-chip>
    </template>

    <template #option="{ opt, itemProps }: { opt: IndexTargetOption; itemProps: any }">
      <q-item v-bind="itemProps" dense>
        <q-item-section side>
          <q-icon :name="KIND_ICONS[opt.kind]" size="18px" class="text-muted" />
        </q-item-section>
        <q-item-section class="font-mono font-13">{{ opt.name }}</q-item-section>
        <q-item-section v-if="opt.kind !== 'index'" side class="text-muted font-13">
          {{ kindLabels[opt.kind] }}
        </q-item-section>
      </q-item>
    </template>

    <template #hint>
      <span data-testid="search-targets-matched" :class="{ 'text-warning': matchedIndices === 0 }">
        {{ matchedIndices === null ? '' : t('search.form.indices.matched', { count: matchedIndices }, matchedIndices) }}
      </span>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { QSelect } from 'quasar'
import { useTranslation } from '../../composables/i18n.ts'
import { IndexTargetOption, useSearchIndexSelect } from '../../composables/components/search/SearchIndexSelect.ts'

const targets = defineModel<string[]>({ required: true })
defineProps<{ matchedIndices: number | null }>()
const t = useTranslation()
const select = ref<QSelect | null>(null)
const { filtered, filter, kindOf } = useSearchIndexSelect()

const KIND_ICONS = { index: 'list', alias: 'link', data_stream: 'stream' }
const optionName = (opt: IndexTargetOption | string) => (typeof opt === 'string' ? opt : opt.name)
const chipIcon = (name: string) => {
  const kind = kindOf(name)
  return kind === 'alias' || kind === 'data_stream' ? KIND_ICONS[kind] : undefined
}
const kindLabels: Record<string, string> = {
  alias: t('search.form.indices.kinds.alias'),
  data_stream: t('search.form.indices.kinds.data_stream')
}
</script>
