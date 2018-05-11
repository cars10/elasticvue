<template>
  <v-container grid-list-md>
    <v-layout row wrap>
      <v-flex xs12>
        <v-card>
          <v-card-title>
            <h2>Browse</h2>
            <reload-button alignLeft title="Reload indices" :action="loadIndices"></reload-button>
          </v-card-title>
          <v-card-text>
            <v-form v-on:submit.prevent="loadResults" class="form-inline">
              <v-text-field class="input--sm" label="Query" v-model="searchQ" id="q"></v-text-field>
              <v-select multiple
                        autocomplete
                        label="Indices"
                        name="Indices"
                        id="indices"
                        v-model="searchIndices"
                        :items="indices"
                        item-value="index"
                        item-text="index"
                        :loading="indicesLoading">
              </v-select>

              <v-btn type="submit">Submit</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-flex>

      <v-flex xs12>
        <results-table :hits="results.hits && results.hits.hits || results" :loading="resultsLoading"></results-table>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import ResultsTable from '@/components/Browse/ResultsTable'
  import ReloadButton from '@/components/shared/ReloadButton'

  export default {
    props: {
      executeSearch: {
        default: false
      }
    },
    data () {
      return {
        indices: [],
        results: [],
        resultsLoading: false,
        indicesLoading: false
      }
    },
    components: {
      ResultsTable,
      ReloadButton
    },
    created () {
      this.loadIndices()
      if (this.executeSearch) this.loadResults()
    },
    methods: {
      loadIndices () {
        this.indicesLoading = true
        this.getElasticsearchAdapter().then(adapter => adapter.getCatIndices()).then(
          indices => {
            this.indices = indices
            this.indicesLoading = false
          }
        ).catch(error => this.$store.commit('setErrorState', error))
      },
      loadResults () {
        this.resultsLoading = true

        this.getElasticsearchAdapter().then(adapter => adapter.search({q: this.searchQ, index: this.searchIndices})).then(
          body => {
            this.results = body
            this.resultsLoading = false
          }
        ).catch(error => this.$store.commit('setErrorState', error))
      }
    },
    computed: {
      searchQ: {
        get () {
          return this.$store.state.search.q
        },
        set (q) {
          this.$store.commit('setQ', q)
        }
      },
      searchIndices: {
        get () {
          return this.$store.state.search.indices
        },
        set (indices) {
          this.$store.commit('setIndices', indices)
        }
      }
    }
  }
</script>
