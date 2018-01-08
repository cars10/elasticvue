<template>
  <div>
    <v-card>
      <v-data-table v-if="hits && hits.length > 0"
                    :rows-per-page-items="[10, 25, 100]"
                    v-bind:headers="headers"
                    v-bind:items="[]">
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
  import { objectArrayUniqueKeys } from '../../helpers'

  export default {
    props: ['hits'],
    data () {
      return {
        headers: objectArrayUniqueKeys(this.hits, '_source').map(value => ({text: value, value: value}))
      }
    },
    methods: {
      onClick (el) {
        this.$router.push({name: 'Document', params: {index: el._index, type: el._type, id: el._id}})
      }
    }
  }
</script>
