<template>
  <div class="width-100">
    <h1>Browse</h1>
    <form v-on:submit.prevent="onSubmit" class="form-inline">
      <md-input-container class="width-auto">
        <label for="indices">Indices</label>
        <md-select multiple name="indices" id="indices" v-model="indices">
          <md-option :value="index.index" :key="index.index" v-for="index in this.$store.state.indices">
            {{ index.index }}
          </md-option>
        </md-select>
      </md-input-container>

      <md-input-container class="width-auto">
        <label for="from">From</label>
        <md-input v-model="from" id="from"></md-input>
      </md-input-container>

      <md-input-container class="width-auto">
        <label for="size">Size</label>
        <md-input v-model="size" id="size"></md-input>
      </md-input-container>
      <md-button class="md-raised" type="submit">Submit</md-button>
    </form>

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
        results: [],
        size: 25,
        from: 0
      }
    },
    components: {
      Results
    },
    methods: {
      onSubmit () {
        console.log('loading')
        let adapter = new ElasticsearchAdapter(this.$store.state.elasticsearchClient)
        adapter.search({index: this.indices, q: '*', size: parseInt(this.size), from: parseInt(this.from)}).then(
          (body) => (this.results = body),
          (error) => this.$store.commit('setErrorState', error)
        )
      }
    }
  }
</script>
