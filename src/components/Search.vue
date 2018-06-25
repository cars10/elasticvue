<template>
  <v-card>
    <v-card-title>
      <h1 class="headline">Search</h1>
      <reload-button title="Reload indices" :action="() => $refs.indicesLoader.loadData()"></reload-button>
    </v-card-title>
    <v-divider></v-divider>

    <v-card-text>
      <v-form @submit.prevent="loadData">
        <v-layout row wrap>
          <v-flex lg2>
            <v-text-field label="Query"
                          name="Query"
                          id="query"
                          v-model="searchQ"
                          append-icon="clear"
                          autofocus
                          @click:append="resetQuery"></v-text-field>
          </v-flex>

          <v-flex>
            <data-loader method="catIndices" ref="indicesLoader" renderContentWhileLoading>
              <template slot-scope="data">
                <custom-v-autocomplete multiple
                                       label="Indices"
                                       name="Indices"
                                       id="indices"
                                       v-model="searchIndices"
                                       :items="data.body | sortIndices"
                                       :loading="data.loading">
                  <template slot="item" slot-scope="data">
                    <v-list-tile-action>
                      <v-checkbox color="primary" :input-value="searchIndices.includes(data.item)"></v-checkbox>
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
              <v-btn type="submit">Submit</v-btn>
            </v-flex>
          </v-flex>
        </v-layout>
      </v-form>
    </v-card-text>

    <v-divider></v-divider>

    <data-loader method="search" :methodParams="searchParams" ref="resultsLoader"
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

  export default {
    name: 'Search',
    props: {
      executeSearch: {
        default: false,
        type: Boolean
      }
    },
    computed: {
      searchQ: {
        get () {
          return this.$store.state.search.q
        },
        set (q) {
          this.$store.commit('setSearchQ', q)
        }
      },
      searchIndices: {
        get () {
          return this.$store.state.search.indices
        },
        set (indices) {
          this.$store.commit('setSearchIndices', indices)
        }
      },
      searchParams () {
        return {q: this.searchQ, index: this.searchIndices}
      }
    },
    methods: {
      loadData () {
        this.$refs.resultsLoader.loadData()
      },
      resetQuery () {
        this.searchQ = '*'
      },
      isChecked (item) {
        return this.searchIndices.includes(item)
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
