<template>
  <q-card class="search-form-card column fit no-wrap overflow-hidden">
    <q-card-section>
        <q-form @submit="submitSearch" @keydown="handleKeydownToSearch">
        <div class="row q-col-gutter-lg">
          <div v-if="!ownTab.searchQueryCollapsed" class="col">
            <div class="autocomplete-wrapper">
              <custom-input 
                v-model="ownTab.q"
                outlined
                type="textarea"
                :rows="2"
                autofocus
                :label="t('search.form.query.label')"
                @keydown.esc="handleEscape"
                @input="handleInput"
                @keydown="handleKeydown"
                @blur="handleBlur"                
                ref="inputRef"
              />              
              <q-list v-if="showSuggestions && filteredSuggestions.length" 
                      class="suggestions-list"
                      bordered
                      separator>
                <q-item
                  v-for="(suggestion, index) in filteredSuggestions"
                  :key="index"                  
                  clickable
                  v-ripple
                  @mousedown.prevent="selectSuggestion(suggestion)"
                  @mouseenter="selectedIndex = index"
                >
                  <q-item-section>
                    <q-item-label v-if="suggestion.text && (suggestion.type == 'function' || suggestion.type == 'operator' || suggestion.type == 'wildcard')">{{ suggestion.text }}</q-item-label>
                    <q-item-label v-if="suggestion.description" >
                      {{ suggestion.description }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section v-if="suggestion.type" side>
                    <q-badge :color="getSuggestionColor(suggestion.type)" :label="suggestion.type" />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
            <search-examples />
          </div>
          <div class="col">
            <index-filter v-model="ownTab.indices" />
          </div>
          <div class="text-center">
              <q-btn flat @click="ownTab.searchQueryCollapsed = !ownTab.searchQueryCollapsed">
                <q-icon :name="ownTab.searchQueryCollapsed ? 'expand_less' : 'expand_more'" />
              </q-btn>
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

    <q-card-section v-if="ownTab.searchQueryCollapsed">
      <q-slide-transition>
        <div v-if="ownTab.searchQueryCollapsed">
          <div class="q-mb-xs">Query</div>
          <resizable-container v-model="resizeStore.searchQuery">
            <code-editor v-model="ownTab.searchQuery" :commands="editorCommands" />
          </resizable-container>
          <q-btn :label="t('search.form.customize_query.reset')"
                  flat
                  size="md"
                  no-caps
                  class="btn-link q-py-none q-px-sm"
                  @click="resetSearchQuery" />
        </div>
      </q-slide-transition>
    </q-card-section>
  
    <q-card v-if="queryParsingError">
      <q-banner class="q-pa-md bg-warning">
        <p>invalid search query</p>
      </q-banner>
    </q-card>
    <loader-status v-else :request-state="requestState" class="column fit no-wrap overflow-hidden">
      <search-results-table :results="searchResults" :tab="ownTab" @request="onRequest" @reload="search" 
        @edit-document="handleEditDocument"
        @add-document="handleAddDocument"
        @delete-document="handleDeleteDocument" />
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
      :_source="editingDocument?._source"
      :_type="editingDocument?._type"
      :_routing="editingDocument?._routing"
      @reload="search"
    />
  </q-card>

</template>

<script setup lang="ts">
  import { defineAsyncComponent, ref, computed, watch } from 'vue'
  import IndexFilter from '../shared/IndexFilter.vue'
  import LoaderStatus from '../shared/LoaderStatus.vue'
  import ResizableContainer from '../shared/ResizableContainer.vue'
  import SearchResultsTable from './SearchResultsTable.vue'
  import { useSearchDocumentsForm } from '../../composables/components/search/SearchDocumentsForm.ts'
  import { useTranslation } from '../../composables/i18n.ts'
  import SearchExamples from './SearchExamples.vue'
  import CustomInput from '../shared/CustomInput.vue'
  import EditDocument from './EditDocument.vue'
  import { SearchState } from '../../store/search.ts'
  import { defineElasticsearchRequest } from '../../composables/CallElasticsearch.ts'
  import { clusterVersionGte } from '../../helpers/minClusterVersion.ts'
  
  const CodeEditor = defineAsyncComponent(() => import('../shared/CodeEditor.vue'))
  const props = defineProps<{ tab: SearchState }>()

  const t = useTranslation()

  const {
    search,
    searchResults,
    ownTab,
    resizeStore,
    queryParsingError,
    requestState,
    editorCommands,
    onRequest,
    resetSearchQuery,
    searchHistory,
    addToHistory
  } = useSearchDocumentsForm(props)

  const resetAndLoad = () => {
    resetSearchQuery()
    search()
  }

  const editDocumentVisible = ref(false)
  const editingDocument = ref<any>({
    _id: '',
    _index: '',
    _type: '_doc',
    _routing: '',
    _source: {}
  })

  const handleEditDocument = (rowData: any) => {
    editingDocument.value = {
      _id: rowData._id,
      _index: rowData._index,
      _type: rowData._type,
      _routing: rowData._routing
    }
    editDocumentVisible.value = true
  }

  const handleAddDocument = () => {
    const index = Array.isArray(ownTab.indices) && ownTab.indices.length > 0 ? ownTab.indices[0] : ''
    editingDocument.value = {
      _id: undefined,
      _index: index,
      _type: getDocType()
    }  
    
    editDocumentVisible.value = true
  }

  const getDocType = (): string => {
    const index = Array.isArray(ownTab.indices) && ownTab.indices.length > 0 ? ownTab.indices[0] : ''
   
    return clusterVersionGte(6) ? '_doc' : index
  }

  const docInfo = (doc: any) => ({
    index: doc._index,
    type: doc._type,
    id: doc._id,
    routing: doc._routing
  })

  // defineElasticsearchRequest used without a component emit here; we'll call search() after successful deletion
  const { run } = defineElasticsearchRequest({ method: 'delete' })

  const handleDeleteDocument = async (rowDatas?: any[]) => {
    if (!rowDatas || rowDatas.length === 0) return

    if (rowDatas.length === 1) {
      // single document delete
      const success = await run({
        params: docInfo(rowDatas[0]),
        confirmMsg: t('search.search_result.delete.confirm', 1),
        snackbarOptions: { body: t('search.search_result.delete.growl', 1) }
      })
      if (success) {
        search()
      }
    } else {
      // bulk delete
      // build the array in the format expected by ElasticsearchAdapter.docsBulkDelete: "index####type####id"
      const docs = rowDatas.map(r => {
        const type = r._type || '_doc' // ensure we always have a type, default to '_doc'
        return `${r._index}####${type}####${r._id}`
      })
      const { run: bulkRun } = defineElasticsearchRequest({ method: 'docsBulkDelete' })
      const success = await bulkRun({
        params: docs,
        confirmMsg: t('search.search_result.delete.confirm', rowDatas.length),
        snackbarOptions: { body: t('search.search_result.delete.growl', rowDatas.length) }
      })
      if (success) {
        search()
      }
    }
  }

  const handleKeydownToSearch = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === ' ') {
      showSuggestions.value = true
    }
    else if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      submitSearch()
    }
  }
  
  watch(() => ownTab.columns, () => {
    loadFieldsFromCollection()
  })
  
  const COL_ACTION ='xxxx_action'
  const showSuggestions = ref(false)
  const selectedIndex = ref(-1)
  const inputRef = ref(null)
  
  
  const availableFields = ref<string[]>([])
  
  const loadFieldsFromCollection = async () => {
    try {      
      let fields = [...ownTab.columns.filter((f:string) => f != COL_ACTION)]
      fields = 
        [
          ...fields,
          ...fields
            .filter((g:string) => g.endsWith('.keyword'))
            .map((f:string) => f.replace('.keyword',''))
        ]
      availableFields.value = fields.sort()
    } catch (error) {
      console.error(t('search.autocomplete.error_fields_loading'), error)
    }
  }

  const staticSuggestions = [
    { text: '*', description: t('search.autocomplete.search_all'), type: 'wildcard' },
    { text: 'AND', description: t('search.autocomplete.and_operator'), type: 'operator' },
    { text: 'OR', description: t('search.autocomplete.or_operator'), type: 'operator' },
    { text: 'NOT', description: t('search.autocomplete.not_operator'), type: 'operator' },
    { text: '_exists_:', description: t('search.autocomplete.field_exists'), type: 'function' },
    { text: ':[min TO max]', description: t('search.autocomplete.range_search'), type: 'operator' },
    { text: ':value*', description: t('search.autocomplete.wildcard_search'), type: 'wildcard' },
    { text: ':"exact phrase"', description: t('search.autocomplete.exact_phrase_search'), type: 'operator' },
    { text: ':value^2', description: t('search.autocomplete.relevance_boost'), type: 'function' },
    { text: ':val~2', description: t('search.autocomplete.fuzzy_search'), type: 'function' },
    { text: '(query1 AND query2)', description: t('search.autocomplete.condition_grouping'), type: 'operator' }
  ]

  const cursorPosition = ref(0)

  const getCurrentFieldContext = computed(() => {
    const query = ownTab.q || ''
    const cursorPos = cursorPosition.value || query.length
     
    const beforeCursor = query.substring(0, cursorPos)
    const match = beforeCursor.match(/(\w+\.)*\w*$/)
    
    if (match) {
      return {
        isTypingField: true,
        fieldPrefix: match[0],
        hasColon: beforeCursor.endsWith(':')
      }
    }
    console.log('getCurrentFieldContext' + { isTypingField: false, fieldPrefix: '', hasColon: false })
    return { isTypingField: false, fieldPrefix: '', hasColon: false }
  })

  const filteredSuggestions = computed(() => {
    const query = ownTab.q?.toLowerCase() || ''
    const fieldContext = getCurrentFieldContext.value
    
    let suggestions: any[] = []
    
    if (fieldContext.isTypingField && fieldContext.fieldPrefix) {
      const fieldPrefix = fieldContext.fieldPrefix.toLowerCase()
      
      const fieldSuggestions = availableFields.value
        .filter(field => field.toLowerCase().startsWith(fieldPrefix))
        .map(field => ({
          text: field + ':',
          description: t('search.autocomplete.field_description', { field }),
          type: 'field'
        }))
      
      suggestions = fieldSuggestions
    } 
    else if (!query || query === '*') {
      const historySuggestions = searchHistory.value.slice(0, 5).map(h => ({
        text: h,
        description: h,
        type: 'history'
      }))
      
      const popularFields = availableFields.value.map(field => ({
        text: field + ':',
        description: t('search.autocomplete.field_description', { field }),
        type: 'field'
      }))
      
      suggestions = [...historySuggestions, ...popularFields, ...staticSuggestions]
    } else {
      suggestions = [...staticSuggestions]
    }
    
    return suggestions
  })

  const getSuggestionColor = (type: string) => {
    const colors: Record<string, string> = {
      'wildcard': 'purple',
      'operator': 'blue',
      'function': 'green',
      'history': 'grey',
      'field': 'orange'
    }
    return colors[type] || 'primary'
  }

  const handleInput = () => {
    if (event && event.target) {
      const input = event.target as HTMLInputElement
      cursorPosition.value = input.selectionStart || 0
    }

    showSuggestions.value = true
    selectedIndex.value = -1
  }

  const suppressSuggestions = ref(false)

  /*
  const handleFocus = () => {
    if (!suppressSuggestions.value) {
      showSuggestions.value = true
    }
    suppressSuggestions.value = false
  }*/

  const handleBlur = () => {
    setTimeout(() => {
      showSuggestions.value = false
      selectedIndex.value = -1
    }, 300) 
  }

  const handleEscape = () => {
    if (showSuggestions.value) {
      showSuggestions.value = false
      selectedIndex.value = -1
    } else {
      ownTab.q = '*'
    }
  }

  const handleKeydown = (event: KeyboardEvent) => {
    const input = event.target as HTMLInputElement
    setTimeout(() => {
      cursorPosition.value = input.selectionStart || 0
    }, 0)

    if (!showSuggestions.value || !filteredSuggestions.value.length) return
    
    switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(
        selectedIndex.value + 1,
        filteredSuggestions.value.length - 1
      )
      break
      
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
      break
      
    case 'Enter':
      if (selectedIndex.value >= 0) {
        event.preventDefault()
        selectSuggestion(filteredSuggestions.value[selectedIndex.value])
      }
      break
      
    case 'Tab':
      if (selectedIndex.value >= 0) {
        event.preventDefault()
        selectSuggestion(filteredSuggestions.value[selectedIndex.value])
      }
      break
    }
  }

  const selectSuggestion = (suggestion: any) => {
    const currentQuery = ownTab.q || ''
    const cursorPos = cursorPosition.value || currentQuery.length
    
    const beforeCursor = currentQuery.substring(0, cursorPos)
    const afterCursor = currentQuery.substring(cursorPos)
    
    const wordMatch = beforeCursor.match(/(\S*)$/)
    const currentWord = wordMatch ? wordMatch[1] : ''
    
    let newQuery = ''
    let newCursorPos = cursorPos
    
    if (suggestion.type === 'history') {
      newQuery = suggestion.text
      newCursorPos = suggestion.text.length
    } else if (currentWord && suggestion.text.toLowerCase().startsWith(currentWord.toLowerCase())) {
      const beforeWord = beforeCursor.substring(0, beforeCursor.length - currentWord.length)
      newQuery = beforeWord + suggestion.text + afterCursor
      newCursorPos = beforeWord.length + suggestion.text.length
    } else {
      newQuery = beforeCursor + suggestion.text + afterCursor
      newCursorPos = beforeCursor.length + suggestion.text.length
    }
    
    ownTab.q = newQuery
    
    showSuggestions.value = false
    selectedIndex.value = -1
    
    suppressSuggestions.value = true
    
    setTimeout(() => {
      if (inputRef.value) {
        const input = (inputRef.value as any).$el.querySelector('input')
        if (input) {
          input.focus()
          input.setSelectionRange(newCursorPos, newCursorPos)
          cursorPosition.value = newCursorPos
        }
      }
    }, 100)
  }

  

  const submitSearch = async () => {
    const query = ownTab.q
    if (query && query !== '*') {
      addToHistory(query)
    }
    await search()
  }
</script>

<style lang="scss">
.search-form-layout {
  min-height: 0; // Important pour que flex-grow fonctionne correctement
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-form-header {
  flex-shrink: 0; // Empêcher l'en-tête de se rétrécir
}

.search-form-card {
  margin-bottom: 1rem;
}

.search-results-wrapper {
  flex: 1 1 auto;
  min-height: 0; // Important pour permettre le scroll
  position: relative;
  display: flex;
  flex-direction: column;
}

.results-table-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden; // Empêcher le débordement
}
</style>

<style scoped>

  .autocomplete-wrapper {
    position: relative;
  }

  .suggestions-list {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: var(--theme-menu-background);
    border: 1px solid var(--theme-background);
    color:var(--theme-color) !important;
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    max-height: 400px;
    overflow-y: auto;
    z-index: 1000;    
  }

  .light .suggestions-list :deep(.q-item) {
    min-height: 28px;
   }
</style>