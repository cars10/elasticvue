<template>
  <v-card>
    <v-card-title>
      <h1 class="text-h5">{{ $t('search.heading') }}</h1>
    </v-card-title>
    <v-divider/>

    <v-card-text>
      <v-form @submit.prevent="search">
        <v-row>
          <v-col cols="12" md="5" sm="12">
            <v-text-field id="query"
                          v-model="q"
                          :label="$t('search.form.query.label')"
                          :messages="$t('search.form.query.messages')"
                          append-icon="mdi-close"
                          autofocus
                          name="query"
                          placeholder="John OR age:25"
                          @keyup.esc="resetQuery"
                          @click:append="resetQuery">
              <template v-slot:message="{ message }">
                <span v-html="message"/>
              </template>
            </v-text-field>
          </v-col>

          <v-col cols="12" md="6" sm="12">
            <index-filter v-model="indices" method="catIndices"/>
          </v-col>

          <v-col cols="12" sm="1">
            <v-btn id="search_submit" class="mt-4" color="primary-button" type="submit">
              {{ $t('search.form.search') }}
            </v-btn>
          </v-col>
        </v-row>

        <v-expand-transition>
          <div v-if="searchQueryCollapsed" class="my-2 pa-2 lowered">
            <p>
              {{ $t('search.form.customize_query.hint') }}
            </p>
            <resizable-container :initial-height="280">
              <code-editor v-model="searchQuery" :external-commands="editorCommands"/>
            </resizable-container>
            <div class="mt-2">
              <button class="btn-link mr-4" type="button" @click="resetSearchQuery">
                {{ $t('search.form.customize_query.reset') }}
              </button>
              <button class="btn-link" type="button" @click="resetSearch">
                {{ $t('search.form.customize_query.reset_all') }}
              </button>
            </div>
          </div>
        </v-expand-transition>

        <div class="text-center pt-2">
          <v-btn class="pl-1" small text @click="searchQueryCollapsed = !searchQueryCollapsed">
            <v-icon>{{ searchQueryCollapsed ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            {{ $t('search.form.customize_query.button') }}
          </v-btn>
        </div>
      </v-form>
    </v-card-text>

    <v-divider/>

    <div v-if="requestState.apiError">
      <div class="d-inline-block mt-4 mx-4">
        <v-alert v-if="requestState.status === 404" :value="true" type="warning">
          404: No matching index found for "{{ indices }}"
        </v-alert>
        <v-alert v-else :value="true" type="error">
          Error {{ requestState.status }}. <br>
          {{ requestState.apiErrorMessage }}
        </v-alert>
      </div>
    </div>
    <div v-else-if="queryParsingError">
      <v-alert :value="true" color="warning">invalid search query</v-alert>
    </div>
    <results-table v-else :body="searchResults" :loading="requestState.loading"/>
  </v-card>
</template>

<script>
  import { ref, watch } from '@vue/composition-api'
  import CodeEditor from '@/components/shared/CodeEditor'
  import IndexFilter from '@/components/shared/IndexFilter'
  import ResizableContainer from '@/components/shared/ResizableContainer'
  import ResultsTable from '@/components/Search/ResultsTable'
  import { vuexAccessors } from '@/helpers/store'
  import { debounce } from '@/helpers'
  import { useElasticsearchRequest } from '@/mixins/RequestComposition'
  import { DEFAULT_DATA_TABLE_OPTIONS, DEFAULT_SEARCH_QUERY } from '@/consts'
  import { buildQueryFromTableOptions, mergeSearchQuery } from '@/helpers/search'
  import { parseJsonBigInt } from '@/helpers/json_parse'

  export default {
    name: 'search',
    components: {
      CodeEditor,
      IndexFilter,
      ResizableContainer,
      ResultsTable
    },
    setup () {
      const {
        q,
        indices,
        searchQuery,
        searchQueryCollapsed,
        options
      } = vuexAccessors('search', ['q', 'indices', 'searchQuery', 'options', 'searchQueryCollapsed'])
      const resetQuery = () => (q.value = '*')
      const resetSearchQuery = () => {
        searchQuery.value = DEFAULT_SEARCH_QUERY
        const newQueryParts = buildQueryFromTableOptions(options.value, {})
        newQueryParts.query = { query_string: { query: q.value } }
        mergeSearchQuery(searchQuery, newQueryParts)
        search()
      }

      const resetSearch = () => {
        searchQuery.value = DEFAULT_SEARCH_QUERY
        options.value = DEFAULT_DATA_TABLE_OPTIONS
        search()
      }

      const searchResults = ref({})
      const queryParsingError = ref(false)
      const { callElasticsearch, requestState } = useElasticsearchRequest()
      const search = () => {
        try {
          queryParsingError.value = false
          const val = parseJsonBigInt(searchQuery.value)
          callElasticsearch('search', val, indices.value)
            .then(result => (searchResults.value = result))
            .catch(() => (searchResults.value = {}))
        } catch (e) {
          searchResults.value = {}
          queryParsingError.value = true
        }
      }

      const debouncedMergeQIntoSearchQuery = debounce(q => {
        mergeSearchQuery(searchQuery, { query: { query_string: { query: q } } })
      }, 100)
      watch(q, debouncedMergeQIntoSearchQuery)

      watch(options, (newValue, oldValue) => {
        const newQueryParts = buildQueryFromTableOptions(newValue, oldValue)
        mergeSearchQuery(searchQuery, newQueryParts)
        search()
      })

      const editorCommands = [{
        bindKey: { win: 'Ctrl+ENTER', mac: 'Command+ENTER', linux: 'Ctrl+ENTER' },
        exec: search
      }]

      return {
        searchQueryCollapsed,
        resetQuery,
        resetSearchQuery,
        resetSearch,
        q,
        indices,
        searchQuery,
        search,
        requestState,
        searchResults,
        editorCommands,
        queryParsingError
      }
    }
  }
</script>
