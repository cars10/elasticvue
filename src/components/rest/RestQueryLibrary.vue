<template>
  <q-dialog v-model="open" position="right">
    <q-card class="tool-panel column no-wrap full-height no-border-radius" data-testid="rest-library">
      <q-card-section class="row items-center no-wrap">
        <div class="text-h6 col">{{ t('query.library.title') }}</div>
        <q-btn v-close-popup flat round dense icon="close" data-testid="rest-library-close" />
      </q-card-section>

      <q-separator />

      <q-tabs v-model="restStore.libraryTab" dense no-caps align="justify">
        <q-tab name="history" data-testid="rest-library-history">
          <div class="row items-center no-wrap q-gutter-x-xs">
            <span>{{ t('query.library.history') }}</span>
            <span class="text-muted font-13">{{ restStore.history.length }}</span>
          </div>
        </q-tab>
        <q-tab name="saved" data-testid="rest-library-saved">
          <div class="row items-center no-wrap q-gutter-x-xs">
            <span>{{ t('query.library.saved') }}</span>
            <span class="text-muted font-13">{{ restStore.savedQueries.length }}</span>
          </div>
        </q-tab>
        <q-tab name="examples" data-testid="rest-library-examples" :label="t('query.library.examples')" />
      </q-tabs>

      <q-separator />

      <div class="row no-wrap items-center q-pa-sm q-gutter-x-sm">
        <filter-input v-model="filter" class="col" />
        <q-btn
          v-if="restStore.libraryTab === 'history' && restStore.history.length"
          flat
          round
          dense
          icon="delete_sweep"
          data-testid="rest-library-clear"
          :title="t('query.library.clear_history')"
          @click="clearHistory"
        />
      </div>

      <q-virtual-scroll v-if="items.length" v-slot="{ item }" :items="items" class="col" separator>
        <q-item
          :key="item.key"
          clickable
          class="q-py-sm"
          data-testid="rest-library-item"
          :title="t('query.library.use')"
          @click="use(item)"
        >
          <q-item-section>
            <q-item-label class="font-mono font-13 ellipsis">
              <span :class="`http-${item.method}`" class="text-weight-bold">{{ item.method }}</span>
              {{ item.path }}
            </q-item-label>
            <q-item-label v-if="item.caption" caption lines="1" class="text-muted">{{ item.caption }}</q-item-label>
            <q-item-label v-if="item.body" caption lines="1" class="font-mono text-muted">{{
              compactBody(item.body)
            }}</q-item-label>
          </q-item-section>

          <q-item-section side>
            <div class="row no-wrap items-center">
              <q-btn
                v-if="restStore.libraryTab === 'history'"
                flat
                round
                dense
                size="sm"
                icon="bookmark_add"
                data-testid="rest-library-save"
                :title="t('query.library.save')"
                @click.stop
              >
                <rest-query-name-prompt
                  :initial-name="`${item.method} ${item.path}`"
                  @save="(name: string) => restStore.saveQuery(item, name)"
                />
              </q-btn>

              <q-btn
                v-if="restStore.libraryTab === 'saved'"
                flat
                round
                dense
                size="sm"
                icon="edit"
                data-testid="rest-library-rename"
                :title="t('query.library.rename')"
                @click.stop
              >
                <rest-query-name-prompt
                  :initial-name="item.caption"
                  @save="(name: string) => restStore.renameQuery(item.id, name)"
                />
              </q-btn>

              <q-btn
                v-if="item.doc"
                flat
                round
                dense
                size="sm"
                icon="menu_book"
                :href="item.doc"
                target="_blank"
                :title="t('query.library.docs')"
                @click.stop
              />

              <q-btn
                flat
                round
                dense
                size="sm"
                icon="open_in_new"
                data-testid="rest-library-new-tab"
                :title="t('query.library.open_new_tab')"
                @click.stop="use(item, true)"
              />

              <q-btn
                v-if="restStore.libraryTab !== 'examples'"
                flat
                round
                dense
                size="sm"
                icon="delete"
                data-testid="rest-library-delete"
                :title="t('query.library.delete')"
                @click.stop="removeItem(item)"
              />
            </div>
          </q-item-section>
        </q-item>
      </q-virtual-scroll>

      <div v-else class="col column items-center q-pa-xl text-muted text-center">
        <q-icon :name="emptyState[restStore.libraryTab].icon" size="32px" class="q-mb-sm" />
        <div class="font-13">{{ filter ? t('query.library.no_results') : emptyState[restStore.libraryTab].text }}</div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import FilterInput from '../shared/FilterInput.vue'
import RestQueryNamePrompt from './RestQueryNamePrompt.vue'
import { compactBody } from '../../helpers/rest.ts'
import { useTranslation } from '../../composables/i18n.ts'
import { RestQueryLibraryItem, useRestQueryLibrary } from '../../composables/components/rest/RestQueryLibrary.ts'

const open = defineModel<boolean>({ required: true })
const t = useTranslation()
const { restStore, filter, items, removeItem, clearHistory } = useRestQueryLibrary()

const use = (item: RestQueryLibraryItem, newTab = false) => {
  restStore.openRequest(item, { newTab })
  open.value = false
}

const emptyState = {
  history: { icon: 'history', text: t('query.library.empty_history') },
  saved: { icon: 'bookmarks', text: t('query.library.empty_saved') },
  examples: { icon: 'search_off', text: t('query.library.empty_examples') }
}
</script>
