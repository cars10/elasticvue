<template>
  <q-input
    ref="input"
    v-model="q"
    name="q"
    input-class="font-mono"
    dense
    outlined
    autofocus
    spellcheck="false"
    hide-bottom-space
    autocomplete="off"
    :label="t('search.form.query.label')"
    data-testid="search-query"
    @update:model-value="suggest"
    @click="suggest"
    @keydown="onKeydown"
    @blur="close"
  >
    <q-menu
      :model-value="suggestions.length > 0"
      no-parent-event
      no-focus
      no-refocus
      fit
      anchor="bottom left"
      self="top left"
      max-height="320px"
    >
      <q-list dense data-testid="search-query-suggestions">
        <q-item
          v-for="(suggestion, index) in suggestions"
          :key="`${suggestion.kind}-${suggestion.label}`"
          clickable
          :active="index === active"
          active-class="bg-dark-grey"
          data-testid="search-query-suggestion"
          @mousedown.prevent="apply(suggestion)"
        >
          <q-item-section side>
            <q-icon :name="KIND_ICONS[suggestion.kind]" size="16px" class="text-muted" />
          </q-item-section>
          <q-item-section class="font-mono font-13">{{ suggestion.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-input>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { QInput } from 'quasar'
import { useTranslation } from '../../composables/i18n.ts'
import {
  applySuggestion,
  queryToken,
  querySuggestions,
  recentQuerySuggestions,
  type QuerySuggestion
} from '../../helpers/search/queryAutocomplete.ts'

const props = defineProps<{ fields: string[]; recent: string[]; loadValues: (field: string) => Promise<string[]> }>()
const emit = defineEmits<{ reset: [] }>()
const q = defineModel<string>({ required: true })
const t = useTranslation()

const KIND_ICONS = { field: 'label', value: 'text_fields', operator: 'functions', recent: 'history' }

const input = ref<QInput | null>(null)
const suggestions = ref<QuerySuggestion[]>([])
const active = ref(-1)
let latest = 0

const nativeInput = () => (input.value?.getNativeElement() as HTMLInputElement | undefined) ?? null

const close = () => {
  latest++
  suggestions.value = []
  active.value = -1
}

const suggest = async () => {
  const element = nativeInput()
  if (!element) return
  const request = ++latest
  const token = queryToken(element.value, element.selectionStart ?? element.value.length)
  const values = token.field !== null ? await props.loadValues(token.field) : []
  if (request !== latest) return

  suggestions.value = [...querySuggestions(token, props.fields, values), ...recentQuerySuggestions(element.value, props.recent)]
  active.value = -1
}

const apply = async (suggestion: QuerySuggestion) => {
  const element = nativeInput()
  if (!element) return
  if (suggestion.kind === 'recent') {
    q.value = suggestion.insert
    close()
    return
  }
  const token = queryToken(element.value, element.selectionStart ?? element.value.length)
  const { text, caret } = applySuggestion(element.value, token, suggestion.insert)
  q.value = text
  await nextTick()
  element.setSelectionRange(caret, caret)
  suggest()
}

const onKeydown = (event: KeyboardEvent) => {
  const open = suggestions.value.length > 0
  if (event.key === 'Escape') {
    if (open) close()
    else emit('reset')
  } else if (open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
    event.preventDefault()
    const last = suggestions.value.length - 1
    active.value = event.key === 'ArrowDown' ? Math.min(active.value + 1, last) : Math.max(active.value - 1, -1)
  } else if (open && active.value >= 0 && (event.key === 'Enter' || event.key === 'Tab')) {
    event.preventDefault()
    apply(suggestions.value[active.value])
  } else if (event.key === 'Enter') {
    close()
  }
}
</script>
