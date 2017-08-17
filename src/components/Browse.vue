<template>
  <div>
    <h1>Browse</h1>
    <md-input-container>
      <label for="indices">Indices</label>
      <md-select multiple name="indices" id="indices" v-model="indices" @change="onChange">
        <md-option :value="index.index" :key="index.index" v-for="index in this.$store.state.indices">
          {{ index.index }}
        </md-option>
      </md-select>
    </md-input-container>


    <results v-if="results && results.hits && results.hits.hits" :hits="results.hits.hits"></results>
  </div>
</template>

<script>
  import Results from '@/components/Browse/Results'
  import ElasticsearchAdapter from '../services/ElasticsearchAdapter'

  export default {
    data () {
      return {
        indices: [],
        results: []
      }
    },
    components: {
      Results
    },
    methods: {
      onChange (indices) {
        let adapter = new ElasticsearchAdapter(this.$store.state.elasticsearchClient)
        adapter.search({index: indices, q: '*'}).then(
          (body) => {
            this.results = body
            console.log(body.hits.hits[0])
          },
          (error) => console.log(error)
        )
      }
    }
  }
</script>
