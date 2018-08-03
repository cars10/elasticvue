<template>
  <v-card>
    <v-card-title>
      <h1 class="headline">Search</h1>
      <reload-button :action="resetIndices" title="Reload indices"/>
    </v-card-title>
    <v-divider/>

    <v-card-text>
      <v-form @submit.prevent="loadData">
        <v-layout row wrap>
          <v-flex lg2>
            <v-text-field id="query"
                          v-model="q"
                          label="Search"
                          name="query"
                          messages="Querying supports the <a tabindex='-1' target='_blank' rel='noopener' href='https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html'>query string DSL</a>"
                          append-icon="clear"
                          autofocus
                          @click:append="resetQuery"/>
          </v-flex>

          <v-flex>
            <data-loader ref="indicesLoader" method="catIndices" render-content-while-loading>
              <template slot-scope="data">
                <custom-v-autocomplete id="indices"
                                       v-model="indices"
                                       :items="data.body | sortIndices"
                                       :loading="data.loading"
                                       multiple
                                       label="Indices"
                                       name="indices">
                  <template slot="item" slot-scope="data">
                    <v-list-tile-action>
                      <v-checkbox :input-value="indices.includes(data.item)" color="primary"/>
                    </v-list-tile-action>
                    <v-list-tile-content>
                      {{data.item}}
                    </v-list-tile-content>
                  </template>
                </custom-v-autocomplete>
              </template>
            </data-loader>
          </v-flex>

          <v-flex lg1>
            <v-flex right>
              <v-btn type="submit" color="primary">Submit</v-btn>
            </v-flex>
          </v-flex>
        </v-layout>

        <div v-if="optionsCollapsed" class="my-2 pa-2 lowered">
          <v-layout row wrap>
            <v-flex lg9>
              <v-text-field v-model="sourceInclude"
                            label="Source includes"
                            name="source_includes"
                            messages="Enter a comma separated list of columns to load"/>
            </v-flex>

            <v-flex lg3>
              <v-text-field v-model="size"
                            label="Size"
                            name="size"/>
            </v-flex>
          </v-layout>
        </div>

        <div class="text-xs-center">
          <a class="grey--text user-select--none" @click="showOptions">More options...
            <v-icon small>{{optionsCollapsed ? 'arrow_upwards' : 'arrow_downwards'}}</v-icon>
          </a>
        </div>
      </v-form>
    </v-card-text>

    <v-divider/>

    <data-loader ref="resultsLoader"
                 :method-params="searchParams"
                 :execute="executeSearch"
                 method="search"
                 render-content-while-loading>
      <template slot-scope="data">
        <results-table :hits="data.body && data.body.hits && data.body.hits.hits || []"
                       :loading="data.loading"/>
      </template>
    </data-loader>
  </v-card>
</template>

<script>
  import ResultsTable from '@/components/Search/ResultsTable'
  import ReloadButton from '@/components/shared/ReloadButton'
  import CustomVAutocomplete from '@/components/shared/CustomVAutocomplete'
  import { mapVuexAccessors } from '../helpers/store'

  export default {
    name: 'Search',
    filters: {
      sortIndices (indices) {
        return indices ? indices.map(index => index.index).sort() : []
      }
    },
    components: {
      ResultsTable,
      ReloadButton,
      CustomVAutocomplete
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
          sourceInclude: this.sourceInclude,
          size: this.size
        }
      },
      ...mapVuexAccessors('search', ['q', 'indices', 'size', 'sourceInclude'])
    },
    methods: {
      loadData () {
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
      resetIndices () {
        this.indices = []
        this.$refs.indicesLoader.loadData()
      }
    }
  }
</script>
