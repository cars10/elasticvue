<template>
  <q-dialog :model-value="true" position="right" no-route-dismiss @update:model-value="(open) => !open && emit('close')">
    <q-card class="tool-panel column no-wrap full-height no-border-radius" data-testid="search-document-panel">
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
            icon="edit"
            :title="t('search.document_panel.edit')"
            data-testid="search-panel-edit"
            @click="edit = true"
          />
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
            <div class="row items-center q-gutter-x-sm q-mb-md">
              <filter-input v-model="filter" class="col" />
              <q-btn
                v-if="surroundingTime !== null"
                flat
                no-caps
                icon="schedule"
                :label="t('search.document_panel.surrounding')"
                data-testid="search-panel-surrounding"
                @click="emit('surrounding')"
              />
            </div>

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

          <resizable-container v-else v-model="resizeStore.searchTable">
            <code-viewer :value="json" />
          </resizable-container>
        </loader-status>
      </q-card-section>
    </q-card>

    <edit-document
      v-model="edit"
      :_id="hit._id"
      :_index="hit._index"
      :_type="hit._type || '_doc'"
      :_routing="hit._routing"
      @reload="emit('reload')"
    />
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref, shallowRef } from 'vue'
import LoaderStatus from '../shared/LoaderStatus.vue'
import FilterInput from '../shared/FilterInput.vue'
import CopyButton from '../shared/CopyButton.vue'
import ResizableContainer from '../shared/ResizableContainer.vue'
import EditDocument from './EditDocument.vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useResizeStore } from '../../store/resize.ts'
import { defineElasticsearchRequest, useElasticsearchAdapter } from '../../composables/CallElasticsearch.ts'
import { flattenDocument, formatFieldValue, getFieldValue } from '../../helpers/search/documentValues.ts'
import { matchesAllTerms } from '../../helpers/filters.ts'
import { stringifyJson } from '../../helpers/json/stringify.ts'
import { hitSource } from '../../composables/components/search/SearchResultsTable.ts'
import type { EsSearchHit } from '../../composables/components/search/SearchDocuments.ts'
import type { SearchFilter } from '../../types/search.ts'

const CodeViewer = defineAsyncComponent(() => import('../shared/CodeViewer.vue'))

const props = defineProps<{ hit: EsSearchHit; timeField: string | null; fetchSource: boolean }>()
const emit = defineEmits<{ close: []; reload: []; surrounding: []; filter: [filter: SearchFilter] }>()
const t = useTranslation()
const resizeStore = useResizeStore()

const tab = ref('fields')
const filter = ref('')
const edit = ref(false)
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
const json = computed(() => stringifyJson(document.value, null, 2))

const isFilterable = (value: unknown) => ['string', 'number', 'boolean'].includes(typeof value)

const surroundingTime = computed(() => {
  if (!props.timeField) return null
  const value = getFieldValue(source.value, props.timeField)
  return value === undefined || value === null ? null : value
})

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
