<template>
  <v-card>
    <v-card-title>
      <h1 class="headline">Search</h1>
      <reload-button title="Reload indices" :action="resetIndices"></reload-button>
    </v-card-title>
    <v-divider></v-divider>

    <v-card-text>
      <v-form @submit.prevent="loadData">
        <v-layout row wrap>
          <v-flex lg2>
            <v-text-field label="Search query"
                          name="query"
                          id="query"
                          messages="Querying supports the <a target='_blank' rel='noopener' href='https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html'>query string DSL</a>"
                          v-model="q"
                          append-icon="clear"
                          autofocus
                          @click:append="resetQuery"></v-text-field>
          </v-flex>

          <v-flex>
            <data-loader method="catIndices" ref="indicesLoader" renderContentWhileLoading>
              <template slot-scope="data">
                <custom-v-autocomplete multiple
                                       label="Indices"
                                       name="indices"
                                       id="indices"
                                       v-model="indices"
                                       :items="data.body | sortIndices"
                                       :loading="data.loading">
                  <template slot="item" slot-scope="data">
                    <v-list-tile-action>
                      <v-checkbox color="primary" :input-value="indices.includes(data.item)"></v-checkbox>
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
            <v-flex xl6>
              <v-text-field label="Source includes"
                            name="source_includes"
                            messages="Enter a comma separated list of columns to load"
                            v-model="sourceInclude"></v-text-field>
            </v-flex>

            <v-flex xl2>
              <v-text-field label="Size"
                            name="size"
                            v-model="size"></v-text-field>
            </v-flex>

            <v-flex xl4>
              <v-layout row wrap>
                <v-flex md6>
                  <v-switch id="show_index" label="Show _index column" v-model="showIndex" hide-details></v-switch>
                </v-flex>

                <v-flex md6 class="">
                  <v-switch id="show_score" label="Show _score column" v-model="showScore" hide-details></v-switch>
                </v-flex>
              </v-layout>
            </v-flex>
          </v-layout>
        </div>

        <div class="text-xs-center">
          <a @click="showOptions" class="grey--text user-select--none">More options...
            <v-icon small>{{optionsCollapsed ? 'arrow_upwards' : 'arrow_downwards'}}</v-icon>
          </a>
        </div>
      </v-form>
    </v-card-text>

    <v-divider></v-divider>

    <data-loader method="search"
                 :methodParams="searchParams"
                 ref="resultsLoader"
                 :execute="executeSearch"
                 renderContentWhileLoading>
      <template slot-scope="data">
        <results-table :hits="data.body && data.body.hits && data.body.hits.hits || []"
                       :loading="data.loading"></results-table>
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
    data () {
      return {
        optionsCollapsed: false
      }
    },
    props: {
      executeSearch: {
        default: false,
        type: Boolean
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
      ...mapVuexAccessors('search', ['q', 'indices', 'size', 'sourceInclude', 'showIndex', 'showScore'])
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
    },
    filters: {
      sortIndices (indices) {
        return indices ? indices.map(index => index.index).sort() : []
      }
    },
    components: {
      ResultsTable,
      ReloadButton,
      CustomVAutocomplete
    }
  }
</script>
