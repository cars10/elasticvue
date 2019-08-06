<template>
  <v-card>
    <v-card-title>
      <h1 class="headline">Search</h1>
    </v-card-title>
    <v-divider/>

    <v-card-text>
      <v-form @submit.prevent="loadData">
        <v-row>
          <v-col cols="12" md="3" sm="12">
            <v-text-field id="query"
                          v-model="q"
                          append-icon="mdi-close"
                          autofocus
                          label="Search"
                          messages="Searching supports the <a tabindex='-1' target='_blank' rel='noopener' href='https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html'>query string DSL</a>"
                          name="query"
                          @click:append="resetQuery"/>
          </v-col>

          <v-col cols="12" md="8" sm="12">
            <index-filter v-model="indices" method="catIndices"/>
          </v-col>

          <v-col cols="12" sm="1">
            <v-btn id="search_submit" class="mt-4" color="primary" type="submit">Search</v-btn>
          </v-col>
        </v-row>

        <div v-if="optionsCollapsed" class="my-2 pa-2 lowered">
          <v-row>
            <v-col lg="9">
              <v-text-field v-model="source"
                            label="Source includes"
                            messages="Enter a comma separated list of columns to load"
                            name="source_includes"/>
            </v-col>

            <v-col lg="3">
              <v-text-field v-model="size" label="Size" name="size"/>
            </v-col>
          </v-row>
        </div>

        <div class="text-center">
          <a class="grey--text user-select--none" @click="showOptions">More options...
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
        <results-table :hits="data.body && data.body.hits && data.body.hits.hits || []"
                       :loading="data.loading"/>
      </template>
    </data-loader>
  </v-card>
</template>

<script>
  import DataLoader from '@/components/shared/DataLoader'
  import ReloadButton from '@/components/shared/ReloadButton'
  import ResultsTable from '@/components/Search/ResultsTable'
  import { mapVuexAccessors } from '../helpers/store'
  import esAdapter from '@/mixins/GetAdapter'
  import IndexFilter from '@/components/shared/IndexFilter'

  export default {
    name: 'Search',
    filters: {
      sortIndices (indices) {
        return indices ? indices.map(index => index.index).sort() : []
      }
    },
    components: {
      DataLoader,
      IndexFilter,
      ReloadButton,
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
      searchParams () {
        return {
          q: this.q,
          index: this.indices,
          source: this.source,
          size: this.size
        }
      },
      ...mapVuexAccessors('search', ['q', 'indices', 'size', 'source'])
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
      isChecked (item) {
        return this.indices.includes(item)
      },
      showOptions () {
        this.optionsCollapsed = !this.optionsCollapsed
      },
      selectOnlyKnownIndices () {
        if (!Array.isArray(this.indices)) return true
        return esAdapter()
          .then(adapter => adapter.catIndices())
          .then(body => {
            const availableIndices = body.map(index => index.index)
            this.indices = this.indices.filter(selectedIndex => availableIndices.includes(selectedIndex))
          })
      }
    }
  }
</script>
