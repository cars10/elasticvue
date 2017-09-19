<template>
  <div class="width-100">
    <md-card>
      <md-card-content>
        <h1>Browse</h1>
        <form v-on:submit.prevent="onSubmit" class="form-inline">
          <md-input-container class="width-auto">
            <label for="indices">Indices</label>
            <md-select multiple name="indices" id="indices" v-model="index">
              <md-option :value="index.index" :key="index.index" v-for="index in this.$store.state.connection.indices">
                {{ index.index }}
              </md-option>
            </md-select>
          </md-input-container>

          <md-input-container class="md-input-container--sm">
            <label for="from">From</label>
            <md-input v-model="from" id="from"></md-input>
          </md-input-container>

          <md-input-container class="md-input-container--sm">
            <label for="size">Size</label>
            <md-input v-model="size" id="size"></md-input>
          </md-input-container>

          <md-input-container class="width-auto">
            <label for="q">Query</label>
            <md-input v-model="q" id="q"></md-input>
          </md-input-container>
          <md-button class="md-raised" type="submit">Submit</md-button>
        </form>
      </md-card-content>
    </md-card>
    <br>

    <results v-if="results && results.hits && results.hits.hits" :hits="results.hits.hits"></results>
  </div>
</template>

<script>
  import Results from '@/components/Browse/Results'
  import ElasticsearchAdapter from '../services/ElasticsearchAdapter'

  export default {
    data () {
      return {
        results: []
      }
    },
    components: {
      Results
    },
    methods: {
      onSubmit () {
        let adapter = new ElasticsearchAdapter(this.$store.state.connection.elasticsearchClient)
        adapter.search(this.$store.state.browse.search).then(
          (body) => (this.results = body),
          (error) => this.$store.commit('setErrorState', error)
        )
      }
    },
    computed: {
      q: {
        get () {
          return this.$store.state.browse.search.q
        },
        set (value) {
          this.$store.commit('setSearchQ', value)
        }
      },
      size: {
        get () {
          return this.$store.state.browse.search.size
        },
        set (value) {
          this.$store.commit('setSearchSize', value)
        }
      },
      from: {
        get () {
          return this.$store.state.browse.search.from
        },
        set (value) {
          this.$store.commit('setSearchFrom', value)
        }
      },
      index: {
        get () {
          return this.$store.state.browse.search.index
        },
        set (value) {
          this.$store.commit('setSearchIndex', value)
        }
      }
    }
  }
</script>
