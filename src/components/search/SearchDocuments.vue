<template>
  <q-card class="q-mb-md">
    <q-card-section class="flex items-center">
      <h1 class="text-h5 q-my-none">
        {{ t('search.heading') }}
      </h1>
      <div class="text-center">
        <q-btn flat @click="searchStore.searchQueryCollapsed = !searchStore.searchQueryCollapsed">
          <q-icon :name="searchStore.searchQueryCollapsed ? 'expand_less' : 'expand_more'" />
        </q-btn>
      </div>
    </q-card-section>
    <q-separator />
    <q-card-section>
      <q-form @submit="submitSearch" @keydown="handleKeydownToSearch">
        <div class="row q-col-gutter-lg">
          <div v-if="!searchStore.searchQueryCollapsed" class="col">
            <div class="autocomplete-wrapper">
              <custom-input 
                v-model="searchStore.q"
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
    <q-card-section v-if="searchStore.searchQueryCollapsed">
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
    </q-card-section>
  </q-card>
  <q-card>
    <q-card v-if="queryParsingError">
      <q-banner class="q-pa-md bg-warning">
        <p>invalid search query</p>
      </q-banner>
    </q-card>
    <loader-status v-else :request-state="requestState">
      <search-results-table :results="searchResults" @request="onRequest" @reload="search" 
          @edit-document="handleEditDocument"
          @add-document="handleAddDocument" />
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
  import { defineAsyncComponent, onMounted, ref, computed, watch } from 'vue'
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

  const handleAddDocument = (rowData?: any) => {
    if (rowData) {
      editingDocument.value = {
        _id: rowData._id,
        _index: rowData._index,
        _type: rowData._type,
        _routing: rowData._routing,
        _source: rowData._source
      }
    } else {
      const index = Array.isArray(searchStore.indices) && searchStore.indices.length > 0 ? searchStore.indices[0] : ''
      editingDocument.value = {
        _id: undefined,
        _index: index,
        _type: '_doc'
      }
    }
    editDocumentVisible.value = true
  }

  const handleKeydownToSearch = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key === ' ') {
      showSuggestions.value = true
    }
    else if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      submitSearch()
    }
  }
  
  watch(() => searchStore.columns, () => {
    loadFieldsFromCollection()
  })
  
  const COL_ACTION ='xxxx_action'
  const showSuggestions = ref(false)
  const selectedIndex = ref(-1)
  const inputRef = ref(null)
  const searchHistory = ref<string[]>([])
  
  const availableFields = ref<string[]>([])
  
  const loadFieldsFromCollection = async () => {
    try {      
      let fields = [...searchStore.columns.filter((f:string) => f != COL_ACTION)]
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

  onMounted(() => {
    loadFieldsFromCollection()
    
    const savedHistory = localStorage.getItem('searchHistory')
    if (savedHistory) {
      try {
        searchHistory.value = JSON.parse(savedHistory)
      } catch (e) {
        console.error(t('search.autocomplete.error_history_loading'), e)
      }
    }
  })

  const cursorPosition = ref(0)

  const getCurrentFieldContext = computed(() => {
    const query = searchStore.q || ''
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
    const query = searchStore.q?.toLowerCase() || ''
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
      searchStore.q = '*'
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
    const currentQuery = searchStore.q || ''
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
    
    searchStore.q = newQuery
    
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

  const addToHistory = (query: string) => {
    if (!query || query === '*') return
    
    const index = searchHistory.value.indexOf(query)
    if (index > -1) {
      searchHistory.value.splice(index, 1)
    }
    
    searchHistory.value.unshift(query)
    
    searchHistory.value = searchHistory.value.slice(0, 20)

    localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value))
  }

  const submitSearch = async () => {
    const query = searchStore.q
    if (query && query !== '*') {
      addToHistory(query)
    }
    await search()
  }
</script>

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