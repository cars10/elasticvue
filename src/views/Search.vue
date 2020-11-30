<template>
  <v-card>
    <v-card-title>
      <h1 class="text-h5">Search</h1>
    </v-card-title>
    <v-divider/>

    <v-card-text>
      <v-form @submit.prevent="loadData">
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

        <div v-if="optionsCollapsed" class="my-2 pa-2 lowered">
          <v-text-field v-model="source"
                        label="Source includes"
                        messages="Enter a comma separated list of columns to load"
                        name="source_includes"/>
        </div>

        <div class="text-center">
          <a class="grey--text user-select--none" @click="optionsCollapsed = !optionsCollapsed">
            More options...
            <v-icon small>{{ optionsCollapsed ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
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
    <results-table v-else :body="data" :loading="requestState.loading"/>
  </v-card>
</template>

<script>
  import ResultsTable from '@/components/Search/ResultsTable'
  import { compositionVuexAccessors } from '@/helpers/store'
  import IndexFilter from '@/components/shared/IndexFilter'
  import { computed, ref, watch } from '@vue/composition-api'
  import Loader from '@/components/shared/Loader'
  import { useElasticsearchRequest } from '@/mixins/RequestComposition'

  export default {
    name: 'Search',
    components: {
      Loader,
      IndexFilter,
      ResultsTable
    },
    setup () {
      const { q, indices, source, options } = compositionVuexAccessors('search', ['q', 'indices', 'source', 'options'])

      const optionsCollapsed = ref(false)
      const sortBy = computed(() => {
        if (Array.isArray(options.value.sortBy) && options.value.sortBy.length > 0) {
          return options.value.sortBy[0]
        } else {
          return null
        }
      })

      const searchParams = computed(() => {
        let order = null

        if (Array.isArray(options.value.sortDesc) && options.value.sortDesc.length > 0) {
          order = options.value.sortDesc[0] ? 'desc' : 'asc'
        }

        return {
          q: q.value,
          index: indices.value,
          source: source.value,
          size: options.value.itemsPerPage,
          from: (options.value.page - 1) * options.value.itemsPerPage,
          sort: sortBy.value,
          order
        }
      })

      let searchDirty = false
      watch(q, () => (searchDirty = true))

      const data = ref({})
      const { callElasticsearch, requestState } = useElasticsearchRequest()
      const load = () => {
        if (searchDirty) options.value.page = 1
        callElasticsearch('search', searchParams.value)
          .then(r => {
            data.value = r
            searchDirty = false
          })
      }

      const loadData = async () => {
        await selectOnlyKnownIndices()
        load()
      }
      const selectOnlyKnownIndices = () => {
        if (!Array.isArray(indices.value)) return true
        return callElasticsearch('catIndices', { h: 'index' })
          .then(body => {
            const availableIndices = body.map(index => index.index)
            indices.value = indices.value.filter(selectedIndex => availableIndices.includes(selectedIndex))
          })
      }

      watch(options, (newOptions, oldOptions) => {
        if (newOptions !== oldOptions) loadData()
      })

      const resetQuery = () => (q.value = '*')

      return {
        optionsCollapsed,
        resetQuery,
        q,
        indices,
        source,
        loadData,
        requestState,
        data
      }
    }
  }
</script>
