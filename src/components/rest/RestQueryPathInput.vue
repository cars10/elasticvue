<template>
  <q-select
    ref="pathSelect"
    :model-value="path"
    :options="suggestions"
    :placeholder="t('query.rest.form.path.placeholder')"
    :aria-label="t('query.rest.form.path.label')"
    name="path"
    input-class="font-mono"
    use-input
    hide-selected
    fill-input
    option-label="path"
    hide-dropdown-icon
    input-debounce="0"
    behavior="menu"
    dense
    outlined
    autofocus
    @filter="filter"
    @input-value="(value: string) => (path = value)"
    @update:model-value="select"
    @new-value="submit"
  >
    <template #option="{ opt, itemProps }: { opt: RestPathSuggestion; itemProps: any }">
      <q-item v-bind="itemProps" class="q-py-sm">
        <q-item-section side class="q-pr-sm">
          <q-icon :name="opt.source === 'saved' ? 'bookmark' : 'history'" size="18px" class="text-muted" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="font-mono font-13 ellipsis">
            <span :class="`http-${opt.method}`" class="text-weight-bold">{{ opt.method }}</span>
            {{ opt.path }}
          </q-item-label>
          <q-item-label v-if="opt.body" caption lines="1" class="font-mono text-muted">
            {{ compactBody(opt.body) }}
          </q-item-label>
        </q-item-section>
        <q-item-section v-if="opt.caption" side class="text-muted font-13">{{ opt.caption }}</q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { QSelect } from 'quasar'
import { useTranslation } from '../../composables/i18n.ts'
import { compactBody, filterSuggestions, indexSuggestions, RestPathSuggestion } from '../../helpers/rest.ts'
import { useRestStore } from '../../store/rest.ts'

const path = defineModel<string>({ required: true })
const emit = defineEmits<{ submit: []; select: [suggestion: RestPathSuggestion] }>()

const t = useTranslation()
const restStore = useRestStore()
const selectRef = useTemplateRef<QSelect>('pathSelect')
const search = ref('')

const index = computed(() => indexSuggestions(restStore.history, restStore.savedQueries))
const suggestions = computed(() => filterSuggestions(index.value, search.value))

const filter = (value: string, update: (fn: () => void) => void) => update(() => (search.value = value))

const select = (item: RestPathSuggestion | null) => {
  if (item) emit('select', item)
}

const submit = () => {
  selectRef.value?.hidePopup()
  emit('submit')
}
</script>
