<template>
  <div>
    <md-card>
      <md-card-content>
        <nested-object :object="document"></nested-object>
      </md-card-content>
    </md-card>
  </div>
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
      this.getElasticsearchAdapter().get({index: this.params.index, type: this.params.type, id: this.params.id}).then(
        (body) => (this.document = body),
        (error) => this.$store.commit('setErrorState', error)
      )
    },
    components: {
      NestedObject
    }
  }
</script>
