<template>
  <v-container grid-list-md>
    <v-layout row wrap>
      <v-flex xs12>
        <v-card>
          <v-card-title>
            <h2>Browse</h2>
            <v-btn flat icon v-on:click="loadIndices">
              <v-icon>cached</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text>
            <v-form v-on:submit.prevent="loadResults" class="form-inline">
              <v-text-field class="input--sm" label="Query" v-model="search.q" id="q"></v-text-field>
              <v-select multiple
                        autocomplete
                        label="Indices"
                        name="Indices"
                        id="indices"
                        v-model="search.index"
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
        <results :hits="results.hits && results.hits.hits || results" :loading="resultsLoading"></results>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import Results from '@/components/Browse/Results'
  import { NORMALIZED_SEARCH_PARAMS } from '../../consts'

  export default {
    data () {
      return {
        indices: [],
        results: [],
        search: Object.assign({}, NORMALIZED_SEARCH_PARAMS),
        resultsLoading: false,
        indicesLoading: false
      }
    },
    components: {
      Results
    },
    created () {
      this.loadIndices()
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

        this.getElasticsearchAdapter().then(adapter => adapter.search(this.search)).then(
          body => {
            this.results = body
            this.resultsLoading = false
          }
        ).catch(error => this.$store.commit('setErrorState', error))
      }
    }
  }
</script>
