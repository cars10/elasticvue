<template>
  <div>
    <button @click="checkIndices">Check indices</button>
    <div v-html="indices"></div>
  </div>
</template>

<script>
  import ElasticsearchAdapter from '../services/ElasticsearchAdapter'

  export default {
    data () {
      return {
        indices: ''
      }
    },
    methods: {
      checkIndices () {
        let adapter = new ElasticsearchAdapter(this.$store.state.elasticsearchClient)
        adapter.getCatIndices().then(
          body => (this.indices = body.map((el) => el.index).join('<br/>')),
          error => console.error('error', error)
        )
      }
    }
  }
</script>
