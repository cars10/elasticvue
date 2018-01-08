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
                    v-model="index"
                    v-bind:items="this.$store.state.connection.indices"
                    item-value="index"
                    item-text="index">
          </v-select>

          <label for="from">From</label>
          <v-text-field v-model="from" id="from"></v-text-field>

          <label for="size">Size</label>
          <v-text-field v-model="size" id="size"></v-text-field>

          <label for="q">Query</label>
          <v-text-field v-model="q" id="q"></v-text-field>
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
