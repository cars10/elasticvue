<template>
  <content-or-connect>
    <div class="width-100">
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
      <br>

      <results :hits="results.hits && results.hits.hits || results" :loading="loading"></results>
    </div>
  </content-or-connect>
</template>

<script>
  import Results from '@/components/Browse/Results'
  import ElasticsearchAdapter from '../services/ElasticsearchAdapter'
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
        let adapter = new ElasticsearchAdapter(this.$store.state.connection.elasticsearchClient)
        adapter.search(this.search).then(
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
