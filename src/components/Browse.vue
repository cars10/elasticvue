<template>
  <content-or-connect>
    <v-container grid-list-md>
      <v-layout row wrap>
        <v-flex xs12>
          <v-card>
            <v-card-text>
              <h1>Browse</h1>
              <v-form v-on:submit.prevent="loadIndices" class="form-inline">
                <v-text-field class="input--sm" label="Query" v-model="search.q" id="q"></v-text-field>
                <v-select multiple
                          autocomplete
                          label="Indices"
                          name="Indices"
                          id="indices"
                          v-model="search.index"
                          v-bind:items="this.$store.state.connection.indices"
                          item-value="index"
                          item-text="index">
                </v-select>

                <v-btn type="submit">Submit</v-btn>
              </v-form>
            </v-card-text>
          </v-card>
        </v-flex>

        <v-flex xs12>
          <results :hits="results.hits && results.hits.hits || results" :loading="loading"></results>
        </v-flex>
      </v-layout>
    </v-container>
  </content-or-connect>
</template>

<script>
  import Results from '@/components/Browse/Results'
  import { NORMALIZED_SEARCH_PARAMS } from '../consts'

  export default {
    data () {
      return {
        results: [],
        search: Object.assign({}, NORMALIZED_SEARCH_PARAMS),
        loading: false
      }
    },
    components: {
      Results
    },
    methods: {
      loadIndices () {
        this.loading = true
        this.getElasticsearchAdapter().search(this.search).then(
          body => {
            this.results = body
            this.loading = false
          },
          error => this.$store.commit('setErrorState', error)
        )
      }
    }
  }
</script>
