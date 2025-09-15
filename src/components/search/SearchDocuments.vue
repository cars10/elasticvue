<template>
  <q-card class="q-mb-md">
    <q-card-section class="flex items-center">
      <h1 class="text-h5 q-my-none">
        {{ t('search.heading') }}
      </h1>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <q-form @submit="search" @keydown="handleKeydownToSearch">
        <div class="row q-col-gutter-lg">
          <div v-if="!searchStore.searchQueryCollapsed" class="col">
            <custom-input v-model="searchStore.q"
                          outlined
                          autofocus
                          :label="t('search.form.query.label')"
                          @keydown.esc="searchStore.q = '*'" />

            <search-examples />
          </div>

          <div class="col">
            <index-filter v-model="searchStore.indices" />
          </div>

          <div class="col-auto">
            <q-btn :label="t('search.form.search')" color="primary-dark" type="submit" class="q-mt-sm" />
            <div v-if="searchResults?.took" class="text-muted font-13 text-center">
              {{ searchResults.took }}ms
            </div>
          </div>
        </div>
      </q-form>
    </q-card-section>

    <q-card-section>
      <q-slide-transition>
        <div v-if="searchStore.searchQueryCollapsed">
          <div class="q-mb-xs">Query</div>
          <resizable-container v-model="resizeStore.searchQuery">
            <code-editor v-model="searchStore.searchQuery" :commands="editorCommands" />
          </resizable-container>

          <q-btn :label="t('search.form.customize_query.reset')"
                 flat
                 size="md"
                 no-caps
                 class="btn-link q-py-none q-px-sm"
                 @click="searchStore.resetSearchQuery" />
        </div>
      </q-slide-transition>

      <div class="text-center">
        <q-btn flat @click="searchStore.searchQueryCollapsed = !searchStore.searchQueryCollapsed">
          <q-icon :name="searchStore.searchQueryCollapsed ? 'expand_less' : 'expand_more'" />
          {{ t('search.form.customize_query.button') }}
        </q-btn>
      </div>
    </q-card-section>
  </q-card>

  <q-card>
    <q-card v-if="queryParsingError">
      <q-banner class="q-pa-md bg-warning">
        <p>invalid search query</p>
      </q-banner>
    </q-card>

    <loader-status v-else :request-state="requestState">
      <search-results-table :results="searchResults" @request="onRequest" @reload="search" @edit-document="handleEditDocument" />
      <template #error>
        <div class="text-center">
          <q-btn :label="t('search.form.customize_query.reset')"
                 size="md"
                 color="positive"
                 class="q-ma-md"
                 @click="resetAndLoad" />
        </div>
      </template>
    </loader-status>

    <edit-document 
      v-model="editDocumentVisible" 
      :_id="editingDocument?._id" 
      :_index="editingDocument?._index" 
      :_type="editingDocument?._type" 
      :_routing="editingDocument?._routing"
      @reload="search" 
    />
  </q-card>
</template>

<script setup lang="ts">
  import { defineAsyncComponent, onMounted, ref } from 'vue'
  import IndexFilter from '../shared/IndexFilter.vue'
  import LoaderStatus from '../shared/LoaderStatus.vue'
  import ResizableContainer from '../shared/ResizableContainer.vue'
  import SearchResultsTable from './SearchResultsTable.vue'
  import { useSearchDocuments } from '../../composables/components/search/SearchDocuments'
  import { useTranslation } from '../../composables/i18n.ts'
  import SearchExamples from './SearchExamples.vue'
  import CustomInput from '../shared/CustomInput.vue'
  import EditDocument from './EditDocument.vue'

  const CodeEditor = defineAsyncComponent(() => import('../shared/CodeEditor.vue'))
  const resetAndLoad = () => {
    searchStore.resetSearchQuery()
    search()
  }

  const t = useTranslation()
  const {
    search,
    searchResults,
    searchStore,
    resizeStore,
    queryParsingError,
    requestState,
    editorCommands,
    onRequest
  } = useSearchDocuments()
  onMounted(search)

  const editDocumentVisible = ref(false)
  const editingDocument = ref<any>(null)

  const handleEditDocument = (rowData: any) => {
    editingDocument.value = {
      _id: rowData._id,
      _index: rowData._index,
      _type: rowData._type,
      _routing: rowData._routing
    }
    editDocumentVisible.value = true
  }

  const handleKeydownToSearch = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      search()
    }
  }
</script>