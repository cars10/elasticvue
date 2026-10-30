<template>
  <q-dialog :model-value="true" position="right" no-route-dismiss @update:model-value="(open) => !open && emit('close')">
    <q-card class="tool-panel document-panel column no-wrap full-height no-border-radius" data-testid="search-document-panel">
      <q-card-section class="q-pa-lg">
        <div class="row items-start no-wrap q-gutter-x-xs">
          <div class="col">
            <div class="text-h6 font-mono word-break-all">{{ hit._id }}</div>
            <div class="text-muted font-mono q-mt-xs">{{ hit._index }}</div>
          </div>
          <q-btn
            flat
            round
            dense
            icon="delete"
            :title="t('search.document_panel.delete')"
            data-testid="search-panel-delete"
            @click="deleteDocument"
          />
          <q-btn flat round dense icon="close" :title="t('defaults.close')" @click="emit('close')" />
        </div>
      </q-card-section>

      <q-tabs v-model="tab" dense no-caps align="left" class="q-px-md">
        <q-tab name="fields" :label="t('search.document_panel.fields')" data-testid="search-panel-tab-fields" />
        <q-tab name="json" label="JSON" data-testid="search-panel-tab-json" />
      </q-tabs>
      <q-separator />

      <q-card-section class="col scroll q-pa-md">
        <loader-status :request-state="requestState">
          <template v-if="tab === 'fields'">
            <filter-input v-model="filter" class="q-mb-md" />

            <q-markup-table flat dense class="table-mono">
              <tbody>
                <tr v-for="[field, value] in filteredFields" :key="field" data-testid="search-panel-field">
                  <td class="text-muted" style="width: 1%; white-space: nowrap">{{ field }}</td>
                  <td class="word-break-all" style="white-space: pre-wrap">{{ formatFieldValue(value) }}</td>
                  <td class="text-right" style="width: 1%; white-space: nowrap">
                    <template v-if="isFilterable(value)">
                      <q-btn
                        flat
                        round
                        dense
                        size="sm"
                        icon="zoom_in"
                        :title="t('search.document_panel.filter_for')"
                        data-testid="search-panel-filter-for"
                        @click="emit('filter', { field, op: 'is', value: String(value) })"
                      />
                      <q-btn
                        flat
                        round
                        dense
                        size="sm"
                        icon="zoom_out"
                        :title="t('search.document_panel.filter_out')"
                        data-testid="search-panel-filter-out"
                        @click="emit('filter', { field, op: 'is', value: String(value), negate: true })"
                      />
                    </template>
                    <q-btn
                      flat
                      round
                      dense
                      size="sm"
                      icon="rule"
                      :title="t('search.document_panel.filter_exists')"
                      data-testid="search-panel-filter-exists"
                      @click="emit('filter', { field, op: 'exists' })"
                    />
                    <copy-button flat round dense size="sm" :value="formatFieldValue(value)" />
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
          </template>

          <template v-else>
            <resizable-container v-model="resizeStore.documentEdit">
              <code-editor v-model="draft" />
            </resizable-container>
            <q-btn
              :label="t('search.edit_document.update.text')"
              :loading="updating"
              color="positive"
              data-testid="search-panel-update"
              @click="updateDocument"
            />
          </template>
        </loader-status>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref, shallowRef, watch } from 'vue'
import LoaderStatus from '../shared/LoaderStatus.vue'
import FilterInput from '../shared/FilterInput.vue'
import CopyButton from '../shared/CopyButton.vue'
import ResizableContainer from '../shared/ResizableContainer.vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useResizeStore } from '../../store/resize.ts'
import { defineElasticsearchRequest, useElasticsearchAdapter } from '../../composables/CallElasticsearch.ts'
import { flattenDocument, formatFieldValue } from '../../helpers/search/documentValues.ts'
import { matchesAllTerms } from '../../helpers/filters.ts'
import { stringifyJson } from '../../helpers/json/stringify.ts'
import { hitSource } from '../../composables/components/search/SearchResultsTable.ts'
import type { EsSearchHit } from '../../composables/components/search/SearchDocuments.ts'
import type { SearchFilter } from '../../types/search.ts'

const CodeEditor = defineAsyncComponent(() => import('../shared/CodeEditor.vue'))

const props = defineProps<{ hit: EsSearchHit; fetchSource: boolean }>()
const emit = defineEmits<{ close: []; reload: []; filter: [filter: SearchFilter] }>()
const t = useTranslation()
const resizeStore = useResizeStore()

const tab = ref('fields')
const filter = ref('')
const document = shallowRef<EsSearchHit>(props.hit)

const { requestState, callElasticsearch } = useElasticsearchAdapter()
onMounted(async () => {
  if (!props.fetchSource) return
  const { _index, _type, _id, _routing } = props.hit
  const loaded = await callElasticsearch('get', { index: _index, type: _type || '_doc', id: _id, routing: _routing }).catch(
    () => null
  )
  if (loaded?._source) document.value = { ...props.hit, _source: loaded._source }
})

const source = computed(() => hitSource(document.value))
const fields = computed(() => Object.entries(flattenDocument(source.value)).sort(([a], [b]) => a.localeCompare(b)))
const filteredFields = computed(() => fields.value.filter(([field]) => matchesAllTerms(field, filter.value)))
const draft = ref('')
watch(source, (value) => (draft.value = stringifyJson(value)), { immediate: true })

const isFilterable = (value: unknown) => ['string', 'number', 'bigint', 'boolean'].includes(typeof value)

const { run: runUpdate, loading: updating } = defineElasticsearchRequest({ method: 'index' })
const updateDocument = async () => {
  const { _index, _type, _id, _routing } = props.hit
  const updated = await runUpdate({
    params: { index: _index, type: _type || '_doc', id: _id, routing: _routing, params: draft.value },
    snackbarOptions: { body: t('search.edit_document.update.growl') }
  })
  if (updated) emit('reload')
}

const { run } = defineElasticsearchRequest({ method: 'delete' })
const deleteDocument = async () => {
  const { _index, _type, _id, _routing } = props.hit
  const deleted = await run({
    params: { index: _index, type: _type || '_doc', id: _id, routing: _routing },
    confirmMsg: t('search.search_result.delete.confirm', 1),
    snackbarOptions: { body: t('search.search_result.delete.growl', 1) }
  })
  if (deleted) {
    emit('reload')
    emit('close')
  }
}
</script>
