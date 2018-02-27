<template>
  <div class="width-100">
    <v-card>
      <v-card-text>
        <h1>Browse</h1>
        <v-form v-on:submit.prevent="onSubmit" class="form-inline">
          <label for="indices">Indices</label>
          <v-select multiple
                    name="indices"
                    id="indices"
                    v-model="search.index"
                    v-bind:items="this.$store.state.connection.indices"
                    item-value="index"
                    item-text="index">
          </v-select>

          <label for="from">From</label>
          <v-text-field v-model="search.from" id="from"></v-text-field>

          <label for="size">Size</label>
          <v-text-field v-model="search.size" id="size"></v-text-field>

          <label for="q">Query</label>
          <v-text-field v-model="search.q" id="q"></v-text-field>
          <v-btn type="submit">Submit</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
    <br>

    <results v-if="results && results.hits && results.hits.hits" :hits="results.hits.hits"></results>
  </div>
</template>

<script>
  import Results from '@/components/Browse/Results'
  import ElasticsearchAdapter from '../services/ElasticsearchAdapter'
  import { NORMALIZED_SEARCH_PARAMS } from '../consts'

  export default {
    data () {
      return {
        results: [],
        search: Object.assign({}, NORMALIZED_SEARCH_PARAMS)
      }
    },
    components: {
      Results
    },
    methods: {
      onSubmit () {
        let adapter = new ElasticsearchAdapter(this.$store.state.connection.elasticsearchClient)
        adapter.search(this.search).then(
          (body) => (this.results = body),
          (error) => this.$store.commit('setErrorState', error)
        )
      }
    }
  }
</script>
