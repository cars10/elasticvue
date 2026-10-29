<template>
  <div class="flex justify-between items-center q-mb-lg">
    <h1 class="page-title">{{ t('search.heading') }}</h1>

    <div class="flex items-center q-gutter-sm">
      <reload-button :action="refresh" v-model="searchStore.reloadInterval" data-testid="search-reload" />
      <q-btn-toggle
        :model-value="searchStore.mode"
        :options="modeOptions"
        no-caps
        unelevated
        dense
        toggle-color="primary-dark"
        color="dark-grey"
        class="q-px-xs"
        data-testid="search-mode"
        @update:model-value="setMode"
      />
      <q-btn
        flat
        no-caps
        icon="history"
        :label="t('search.library.title')"
        data-testid="search-library-open"
        @click="libraryOpen = true"
      />
      <q-btn
        flat
        no-caps
        icon="terminal"
        :label="t('search.form.open_in_rest')"
        data-testid="search-open-rest"
        @click="openInRest"
      />
      <copy-button flat round :custom-handler="copyAsCurl" :title="t('search.form.copy_curl')" data-testid="search-copy-curl" />
    </div>
  </div>

  <q-card class="q-mb-md">
    <q-card-section>
      <q-form @submit.prevent="submitSearch">
        <div class="row q-col-gutter-md items-start">
          <div v-if="!isSql" class="col-12 col-md-4">
            <search-index-select v-model="searchStore.targets" :matched-indices="matchedIndices" />
          </div>

          <div class="col">
            <search-query-input
              v-if="searchStore.mode === 'query'"
              v-model="searchStore.q"
              :fields="catalogFields"
              :recent="recentQueries"
              :load-values="loadValues"
              @reset="searchStore.q = '*'"
            />
            <search-examples v-if="searchStore.mode === 'query'" />
            <q-input
              v-else-if="isSql"
              v-model="sqlModel"
              type="textarea"
              autogrow
              outlined
              dense
              spellcheck="false"
              input-class="font-mono"
              :label="searchStore.mode === 'sql' ? t('search.sql.sql_label') : t('search.sql.esql_label')"
              :hint="t('search.sql.hint')"
              data-testid="search-sql-query"
              @keydown.ctrl.enter.prevent="submitSearch"
              @keydown.meta.enter.prevent="submitSearch"
            />
            <div v-else class="text-muted font-13 q-pt-sm">{{ t('search.form.mode.dsl_hint') }}</div>
          </div>

          <div v-if="searchStore.mode === 'query' && timeField" class="col-auto">
            <search-time-range
              :model-value="searchStore.timeRange"
              :field="timeField"
              :fields="timeFields"
              @update:model-value="setTimeRange"
              @update:field="setTimeField"
            />
          </div>

          <div class="col-auto">
            <q-btn
              type="submit"
              unelevated
              no-caps
              color="primary-dark"
              icon-right="search"
              :label="t('search.form.search')"
              data-testid="search-submit"
            />
          </div>
        </div>

        <search-filters
          v-if="searchStore.mode === 'query'"
          v-model="searchStore.filters"
          :fields="catalogFields"
          :load-values="loadValues"
        />

        <resizable-container v-if="searchStore.mode === 'dsl'" v-model="resizeStore.searchQuery" class="q-mt-md">
          <div class="full-height" data-testid="search-dsl">
            <code-editor v-model="searchStore.dslBody" :commands="editorCommands" />
          </div>
        </resizable-container>
      </q-form>
    </q-card-section>
  </q-card>

  <q-card v-if="showHistogram" class="q-mb-md">
    <div class="row items-center q-px-sm q-py-xs">
      <q-btn
        flat
        dense
        no-caps
        :icon="searchStore.histogramCollapsed ? 'chevron_right' : 'expand_more'"
        :label="t('search.histogram.title')"
        data-testid="search-histogram-toggle"
        @click="toggleHistogram"
      />
      <span v-if="!searchStore.histogramCollapsed && histogram.interval.value" class="text-muted font-13 q-ml-sm">
        {{ t('search.histogram.interval', { interval: histogram.interval.value }) }}
      </span>
      <q-spinner v-if="histogram.requestState.value.loading" size="14px" class="q-ml-sm" />
    </div>
    <q-card-section v-if="!searchStore.histogramCollapsed" class="q-pt-none">
      <search-histogram :buckets="histogram.buckets.value" :interval="histogram.interval.value" @select="setTimeRange" />
    </q-card-section>
  </q-card>

  <q-card v-if="isSql">
    <loader-status :request-state="sql.requestState.value">
      <search-sql-results
        :columns="sql.columns.value"
        :rows="sql.rows.value"
        :cursor="sql.cursor.value"
        @load-more="sql.loadMore"
      />
    </loader-status>
  </q-card>

  <q-card v-else>
    <q-banner v-if="queryParsingError" class="tool-banner tool-banner--warning q-ma-md" data-testid="search-invalid-json">
      {{ t('search.form.invalid_json') }}
    </q-banner>

    <loader-status v-else :request-state="requestState">
      <search-results-table
        :results="results"
        :catalog="catalog"
        :catalog-skipped="catalogSkipped"
        :major-version="majorVersion"
        :total="totalHits"
        :loading="requestState.loading"
        @request="onRequest"
        @reload="search"
        @count-exactly="countExactly"
        @open="(hit: EsSearchHit) => (openHit = hit)"
      />
    </loader-status>
  </q-card>

  <search-document-panel
    v-if="openHit"
    :key="hitKey(openHit)"
    :hit="openHit"
    :time-field="searchStore.mode === 'query' ? timeField : null"
    :fetch-source="searchStore.sourceOnlyVisible"
    @close="openHit = null"
    @reload="search"
    @filter="addFilter"
    @surrounding="showSurrounding(openHit)"
  />

  <search-library v-model="libraryOpen" :current-entry="currentEntry" @apply="applyEntry" />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'
import LoaderStatus from '../shared/LoaderStatus.vue'
import ResizableContainer from '../shared/ResizableContainer.vue'
import CopyButton from '../shared/CopyButton.vue'
import SearchIndexSelect from './SearchIndexSelect.vue'
import SearchResultsTable from './SearchResultsTable.vue'
import SearchExamples from './SearchExamples.vue'
import SearchQueryInput from './SearchQueryInput.vue'
import SearchFilters from './SearchFilters.vue'
import SearchDocumentPanel from './SearchDocumentPanel.vue'
import SearchSqlResults from './SearchSqlResults.vue'
import SearchLibrary from './SearchLibrary.vue'
import { hitKey } from '../../composables/components/search/SearchResultsTable.ts'
import type { EsSearchHit } from '../../composables/components/search/SearchDocuments.ts'
import SearchTimeRange from './SearchTimeRange.vue'
import SearchHistogram from './SearchHistogram.vue'
import ReloadButton from '../shared/ReloadButton.vue'
import { useSearchDocuments } from '../../composables/components/search/SearchDocuments'
import { useResizeStore } from '../../store/resize.ts'
import { useTranslation } from '../../composables/i18n.ts'

const CodeEditor = defineAsyncComponent(() => import('../shared/CodeEditor.vue'))

const t = useTranslation()
const resizeStore = useResizeStore()

const MODE_LABELS = {
  query: t('search.form.mode.query'),
  dsl: t('search.form.mode.dsl'),
  sql: t('search.form.mode.sql'),
  esql: t('search.form.mode.esql')
}
const libraryOpen = ref(false)

const {
  searchStore,
  modes,
  sql,
  results,
  openHit,
  catalog,
  catalogFields,
  loadValues,
  catalogSkipped,
  matchedIndices,
  majorVersion,
  timeFields,
  timeField,
  showHistogram,
  histogram,
  totalHits,
  requestState,
  queryParsingError,
  search,
  submitSearch,
  currentEntry,
  applyEntry,
  refresh,
  setTimeRange,
  setTimeField,
  toggleHistogram,
  addFilter,
  showSurrounding,
  onRequest,
  setMode,
  countExactly,
  openInRest,
  copyAsCurl,
  editorCommands
} = useSearchDocuments()

const modeOptions = computed(() => modes.value.map((mode) => ({ label: MODE_LABELS[mode], value: mode })))
const recentQueries = computed(() =>
  [...searchStore.savedSearches, ...[...searchStore.history].reverse()]
    .filter((entry) => entry.mode === 'query')
    .map((entry) => entry.query)
)
const isSql = computed(() => searchStore.mode === 'sql' || searchStore.mode === 'esql')
const sqlModel = computed({
  get: () => (searchStore.mode === 'esql' ? searchStore.esqlQuery : searchStore.sqlQuery),
  set: (value: string) => {
    if (searchStore.mode === 'esql') searchStore.esqlQuery = value
    else searchStore.sqlQuery = value
  }
})
</script>
