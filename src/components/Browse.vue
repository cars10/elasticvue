<template>
  <div class="width-100">
    <md-card>
      <md-card-content>
        <h1>Browse</h1>
        <form v-on:submit.prevent="onSubmit" class="form-inline">
          <md-input-container class="width-auto">
            <label for="indices">Indices</label>
            <md-select multiple name="indices" id="indices" v-model="search.index">
              <md-option :value="index.index" :key="index.index" v-for="index in this.$store.state.indices">
                {{ index.index }}
              </md-option>
            </md-select>
          </md-input-container>

          <md-input-container class="md-input-container--sm">
            <label for="from">From</label>
            <md-input v-model="search.from" id="from"></md-input>
          </md-input-container>

          <md-input-container class="md-input-container--sm">
            <label for="size">Size</label>
            <md-input v-model="search.size" id="size"></md-input>
          </md-input-container>

          <md-input-container class="width-auto">
            <label for="q">Query</label>
            <md-input v-model="search.q" id="q"></md-input>
          </md-input-container>
          <md-button class="md-raised" type="submit">Submit</md-button>
        </form>
      </md-card-content>
    </md-card>
    <br>

    <results v-if="result && result.hits && result.hits.hits" :hits="result.hits.hits"></results>
  </div>
</template>

<script>
  import Results from '@/components/Browse/Results'
  import ElasticsearchAdapter from '../services/ElasticsearchAdapter'
  import Search from '../models/elasticsearch/search'

  export default {
    data () {
      return {
        result: [],
        search: new Search({})
      }
    },
    components: {
      Results
    },
    methods: {
      onSubmit () {
        let adapter = new ElasticsearchAdapter(this.$store.state.elasticsearchClient)
        adapter.search(this.search.evaluate()).then(
          (body) => (this.result = body),
          (error) => this.$store.commit('setErrorState', error)
        )
      }
    }
  }
</script>
