<template>
  <v-card>
    <v-card-title>
      {{this.params.index}} / {{this.params.type}} / {{this.params.id}}
    </v-card-title>
  </v-card>
</template>

<script>
  import NestedObject from '@/components/NestedObject/NestedObject'

  export default {
    data () {
      return {
        document: null,
        params: this.$route.params
      }
    },
    created () {
      this.getElasticsearchAdapter().then(
        adapter => adapter.get({index: this.params.index, type: this.params.type, id: this.params.id})
      ).then(
        (body) => (this.document = body),
        (error) => this.$store.commit('setErrorState', error)
      )
    },
    components: {
      NestedObject
    }
  }
</script>
