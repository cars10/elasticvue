<template>
  <v-card>
    <v-card-title>
      <h1 class="text-h5">Search</h1>
    </v-card-title>
    <v-divider/>

    <v-card-text>
      <v-form @submit.prevent="search">
        <v-row>
          <v-col cols="12" md="5" sm="12">
            <v-text-field id="query"
                          v-model="q"
                          append-icon="mdi-close"
                          autofocus
                          label="Search"
                          messages="Searching supports the <a tabindex='-1' target='_blank' rel='noopener' href='https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html'>query string DSL</a>"
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
            <v-btn id="search_submit" class="mt-4" color="primary" type="submit">Search</v-btn>
          </v-col>
        </v-row>

        <div v-if="searchQueryCollapsed" class="my-2 pa-2 lowered">
          <p>
            Customize the search query
          </p>
          <p class="grey--text">
            Hint: changes to the query will not update the respecting inputs in the ui (like the search query or
            pagination/sort in the table), but changes to the inputs will be merged into the query again.
          </p>
          <resizable-container :initial-height="280">
            <code-editor v-model="searchQuery" :external-commands="editorCommands"/>
          </resizable-container>
          <div class="mt-2">
            <a href="javascript:void(0)" role="button" @click="resetSearchQuery">Reset custom query</a>
          </div>
        </div>

        <div class="text-center pt-2">
          <a class="grey--text user-select--none" @click="searchQueryCollapsed = !searchQueryCollapsed">
            <v-icon small>{{ searchQueryCollapsed ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            <v-badge content="new" small color="green">Customize query</v-badge>
          </a>
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
  import { onMounted, ref, watch } from '@vue/composition-api'
  import CodeEditor from '@/components/shared/CodeEditor'
  import IndexFilter from '@/components/shared/IndexFilter'
  import ResizableContainer from '@/components/shared/ResizableContainer'
  import ResultsTable from '@/components/Search/ResultsTable'
  import { compositionVuexAccessors } from '@/helpers/store'
  import { debounce } from '@/helpers'
  import { useElasticsearchRequest } from '@/mixins/RequestComposition'
  import { DEFAULT_SEARCH_QUERY } from '@/consts'
  import { buildQueryFromTableOptions, mergeSearchQuery } from '@/helpers/search'

  export default {
    name: 'Search',
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
      } = compositionVuexAccessors('search', ['q', 'indices', 'searchQuery', 'options', 'searchQueryCollapsed'])
      const resetQuery = () => (q.value = '*')
      const resetSearchQuery = () => {
        searchQuery.value = DEFAULT_SEARCH_QUERY
        const newQueryParts = buildQueryFromTableOptions(options.value, {})
        newQueryParts.query = { query_string: { query: q.value } }
        mergeSearchQuery(searchQuery, newQueryParts)
      }

      const searchResults = ref({})
      const queryParsingError = ref(false)
      const { callElasticsearch, requestState } = useElasticsearchRequest()
      const search = () => {
        try {
          queryParsingError.value = false
          const val = JSON.parse(searchQuery.value)
          callElasticsearch('search', val, indices.value)
            .then(result => (searchResults.value = result))
        } catch (e) {
          queryParsingError.value = true
        }
      }

      onMounted(search)

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
