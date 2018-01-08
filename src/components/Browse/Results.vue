<template>
  <div>
    <v-card>
      <v-data-table v-if="hits && hits.length > 0"
                    :rows-per-page-items="[10, 25, 100]"
                    v-bind:headers="Object.keys(hits[0])"
                    v-bind:items="hits">
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
  export default {
    props: ['hits'],
    data () {
      return {}
    },
    methods: {
      onClick (el) {
        this.$router.push({name: 'Document', params: {index: el._index, type: el._type, id: el._id}})
      }
    }
  }
</script>
