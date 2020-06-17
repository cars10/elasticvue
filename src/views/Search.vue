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
                          placeholder="John OR age:25"
                          messages="Searching supports the <a tabindex='-1' target='_blank' rel='noopener' href='https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html'>query string DSL</a>"
                          name="query"
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
            <v-icon small>{{optionsCollapsed ? 'mdi-chevron-up' : 'mdi-chevron-down'}}</v-icon>
          </a>
        </div>
      </v-form>
    </v-card-text>

    <v-divider/>

    <data-loader ref="resultsLoader"
                 :execute="false"
                 :method-params="searchParams"
                 method="search"
                 render-content-while-loading>
      <template v-slot:default="data">
        <results-table :body="data.body" :loading="data.loading"/>
      </template>
    </data-loader>
  </v-card>
</template>

<script>
  import DataLoader from '@/components/shared/DataLoader'
  import ResultsTable from '@/components/Search/ResultsTable'
  import { mapVuexAccessors } from '@/helpers/store'
  import esAdapter from '@/mixins/GetAdapter'
  import IndexFilter from '@/components/shared/IndexFilter'

  export default {
    name: 'Search',
    components: {
      DataLoader,
      IndexFilter,
      ResultsTable
    },
    props: {
      executeSearch: {
        default: false,
        type: Boolean
      }
    },
    data () {
      return {
        optionsCollapsed: false
      }
    },
    computed: {
      sortBy () {
        if (Array.isArray(this.options.sortBy) && this.options.sortBy.length > 0) {
          return this.options.sortBy[0]
        } else {
          return null
        }
      },
      searchParams () {
        let order = null

        if (Array.isArray(this.options.sortDesc) && this.options.sortDesc.length > 0) {
          order = this.options.sortDesc[0] ? 'asc' : 'desc'
        }

        return {
          q: this.q,
          index: this.indices,
          source: this.source,
          size: this.options.itemsPerPage,
          from: (this.options.page - 1) * this.options.itemsPerPage,
          sort: this.sortBy,
          order
        }
      },
      ...mapVuexAccessors('search', ['q', 'indices', 'source', 'options', 'filter'])
    },
    watch: {
      options () {
        this.loadData()
      }
    },
    created () {
      if (this.executeSearch || this.indices.length > 0) this.loadData()
    },
    methods: {
      async loadData () {
        await this.selectOnlyKnownIndices()
        this.$refs.resultsLoader.loadData()
      },
      resetQuery () {
        this.q = '*'
      },
      selectOnlyKnownIndices () {
        if (!Array.isArray(this.indices)) return true
        return esAdapter()
          .then(adapter => adapter.catIndices({ h: 'index' }))
          .then(body => {
            const availableIndices = body.map(index => index.index)
            this.indices = this.indices.filter(selectedIndex => availableIndices.includes(selectedIndex))
          })
      }
    }
  }
</script>
