<template>
  <v-card>
    <v-card-title>
      <h1 class="headline">Browse</h1>
      <reload-button alignLeft title="Reload indices" :action="() => $refs.indicesLoader.loadData()"></reload-button>
    </v-card-title>
    <v-divider></v-divider>

    <v-card-text>
      <v-form v-on:submit.prevent="loadData">
        <v-layout row wrap>
          <v-flex xs2>
            <v-text-field label="Query" name="Query" id="query" v-model="browseQ"></v-text-field>
          </v-flex>

          <v-flex>
            <data-loader method="getCatIndices" ref="indicesLoader" renderContentWhileLoading>
              <template slot-scope="data">
                <v-select multiple
                          auto
                          autocomplete
                          label="Indices"
                          name="Indices"
                          id="indices"
                          v-model="browseIndices"
                          :items="data.body | sortIndices"
                          :loading="data.loading">
                </v-select>
              </template>
            </data-loader>
          </v-flex>

          <v-flex xs1>
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
  import ResultsTable from '@/components/Browse/ResultsTable'
  import ReloadButton from '@/components/shared/ReloadButton'

  export default {
    name: 'Browse',
    props: {
      executeSearch: {
        default: false
      }
    },
    computed: {
      browseQ: {
        get () {
          return this.$store.state.browse.q
        },
        set (q) {
          this.$store.commit('setBrowseQ', q)
        }
      },
      browseIndices: {
        get () {
          return this.$store.state.browse.indices
        },
        set (indices) {
          this.$store.commit('setBrowseIndices', indices)
        }
      },
      searchParams () {
        return {q: this.browseQ, index: this.browseIndices}
      }
    },
    methods: {
      loadData () {
        this.$refs.resultsLoader.loadData()
      }
    },
    filters: {
      sortIndices (indices) {
        return indices ? indices.map(index => index.index).sort() : []
      }
    },
    components: {
      ResultsTable,
      ReloadButton
    }
  }
</script>
