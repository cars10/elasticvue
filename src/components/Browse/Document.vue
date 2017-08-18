<template>
  <div>
    <dl v-html="printProxy(document, 'blockquote')"></dl>
  </div>
</template>

<script>
  import ElasticsearchAdapter from '../../services/ElasticsearchAdapter'
  import { printNestedObject } from '../../helpers'

  export default {
    data () {
      return {
        document: null,
        params: this.$route.params
      }
    },
    created () {
      console.log(this.$route.params)
      let adapter = new ElasticsearchAdapter(this.$store.state.elasticsearchClient)
      adapter.get({index: this.params.index, type: this.params.type, id: this.params.id}).then(
        (body) => (this.document = body),
        (error) => this.$store.commit('setErrorState', error)
      )
    },
    methods: {
      printProxy (object, domElement) {
        return printNestedObject(object, domElement)
      }
    }
  }
</script>
