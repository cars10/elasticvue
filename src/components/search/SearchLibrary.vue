<template>
  <q-dialog v-model="open" position="right">
    <q-card class="tool-panel column no-wrap full-height no-border-radius" data-testid="search-library">
      <q-card-section class="row items-center no-wrap q-gutter-x-xs">
        <div class="text-h6 col">{{ t('search.library.title') }}</div>
        <q-btn
          flat
          no-caps
          icon="bookmark_add"
          :label="t('search.library.save_current')"
          data-testid="search-library-save-current"
        >
          <rest-query-name-prompt :initial-name="currentName" @save="saveCurrent" />
        </q-btn>
        <q-btn v-close-popup flat round dense icon="close" />
      </q-card-section>

      <q-separator />

      <q-tabs v-model="tab" dense no-caps align="justify">
        <q-tab name="history" data-testid="search-library-history">
          <div class="row items-center no-wrap q-gutter-x-xs">
            <span>{{ t('search.library.history') }}</span>
            <span class="text-muted font-13">{{ searchStore.history.length }}</span>
          </div>
        </q-tab>
        <q-tab name="saved" data-testid="search-library-saved">
          <div class="row items-center no-wrap q-gutter-x-xs">
            <span>{{ t('search.library.saved') }}</span>
            <span class="text-muted font-13">{{ searchStore.savedSearches.length }}</span>
          </div>
        </q-tab>
      </q-tabs>

      <q-separator />

      <div class="row no-wrap items-center q-pa-sm q-gutter-x-sm">
        <filter-input v-model="filter" class="col" />
        <q-btn
          v-if="tab === 'history' && searchStore.history.length"
          flat
          round
          dense
          icon="delete_sweep"
          :title="t('search.library.clear_history')"
          data-testid="search-library-clear"
          @click="clearHistory"
        />
      </div>

      <q-virtual-scroll v-if="items.length" v-slot="{ item }: { item: IdbSearchEntry }" :items="items" class="col" separator>
        <q-item :key="item.id" clickable class="q-py-sm" data-testid="search-library-item" @click="apply(item)">
          <q-item-section>
            <q-item-label v-if="item.name" class="text-weight-medium ellipsis">{{ item.name }}</q-item-label>
            <q-item-label class="font-mono font-13 ellipsis">
              <q-badge color="dark-grey" class="q-mr-xs">{{ MODE_LABELS[item.mode] }}</q-badge>
              {{ item.query }}
            </q-item-label>
            <q-item-label caption lines="1" class="text-muted">{{ caption(item) }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="row no-wrap items-center">
              <q-btn
                v-if="tab === 'history'"
                flat
                round
                dense
                size="sm"
                icon="bookmark_add"
                :title="t('search.library.save')"
                data-testid="search-library-save"
                @click.stop
              >
                <rest-query-name-prompt :initial-name="item.query" @save="(name: string) => searchStore.saveSearch(item, name)" />
              </q-btn>
              <q-btn
                v-else
                flat
                round
                dense
                size="sm"
                icon="edit"
                :title="t('search.library.rename')"
                data-testid="search-library-rename"
                @click.stop
              >
                <rest-query-name-prompt
                  :initial-name="item.name || ''"
                  @save="(name: string) => searchStore.renameSearch(item.id, name)"
                />
              </q-btn>
              <q-btn
                flat
                round
                dense
                size="sm"
                icon="delete"
                :title="t('search.library.remove')"
                data-testid="search-library-remove"
                @click.stop="remove(item)"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-virtual-scroll>
      <div v-else class="text-muted text-center q-pa-lg" data-testid="search-library-empty">
        {{ t('search.library.empty') }}
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import FilterInput from '../shared/FilterInput.vue'
import RestQueryNamePrompt from '../rest/RestQueryNamePrompt.vue'
import { useSearchStore } from '../../store/search.ts'
import { useTranslation } from '../../composables/i18n.ts'
import { askConfirm } from '../../helpers/dialogs.ts'
import { matchesAllTerms } from '../../helpers/filters.ts'
import { entryText } from '../../helpers/search/searchLibrary.ts'
import type { IdbSearchEntry } from '../../db/types.ts'

const open = defineModel<boolean>({ required: true })
const props = defineProps<{ currentEntry: () => IdbSearchEntry | null }>()
const emit = defineEmits<{ apply: [entry: IdbSearchEntry] }>()
const t = useTranslation()
const searchStore = useSearchStore()

const MODE_LABELS = {
  query: t('search.form.mode.query'),
  dsl: t('search.form.mode.dsl'),
  sql: t('search.form.mode.sql'),
  esql: t('search.form.mode.esql')
}

const tab = ref<'history' | 'saved'>('history')
const filter = ref('')

watch(open, (value) => value && searchStore.loadLibrary())

const items = computed(() => {
  const list = tab.value === 'history' ? [...searchStore.history].reverse() : searchStore.savedSearches
  return list.filter((entry) => matchesAllTerms(entryText(entry), filter.value))
})

const currentName = computed(() => (open.value ? (props.currentEntry()?.query ?? '') : ''))

const caption = (entry: IdbSearchEntry) =>
  [
    entry.targets.join(', '),
    entry.filters.length > 0 && t('search.library.filters', { count: entry.filters.length }, entry.filters.length),
    entry.timeRange && `${entry.timeRange.from} → ${entry.timeRange.to}`,
    entry.date && new Date(entry.date).toLocaleString()
  ]
    .filter(Boolean)
    .join(' · ')

const saveCurrent = (name: string) => {
  const entry = props.currentEntry()
  if (!entry) return
  searchStore.saveSearch(entry, name)
  tab.value = 'saved'
}

const apply = (entry: IdbSearchEntry) => {
  emit('apply', entry)
  open.value = false
}

const remove = (entry: IdbSearchEntry) =>
  tab.value === 'history' ? searchStore.removeHistory(entry.id) : searchStore.removeSaved(entry.id)

const clearHistory = async () => {
  if (await askConfirm(t('search.library.clear_confirm'))) searchStore.clearHistory()
}
</script>
