<template>
  <div>
    <v-card>
      <v-data-table v-if="hits && hits.length > 0"
                    :rows-per-page-items="[10, 25, 100]"
                    v-bind:headers="headers"
                    v-bind:items="hits">
        <template slot="items" slot-scope="item">
          <td>{{ item.item._index }}</td>
          <td>{{ item.item._id}}</td>
          <td>{{ item.item._type}}</td>
          <td v-for="key in keys" :key="item.item._index + '_' + key">{{item.item._source[key]}}</td>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
  import { objectArrayUniqueKeys } from '../../helpers'

  const DEFAULT_KEYS = ['_index', '_id', '_type']

  export default {
    props: ['hits'],
    data () {
      return {
        keys: objectArrayUniqueKeys(this.hits, '_source')
      }
    },
    methods: {
      onClick (el) {
        this.$router.push({name: 'Document', params: {index: el._index, type: el._type, id: el._id}})
      }
    },
    computed: {
      headers () {
        let defaultKeyHeaders = DEFAULT_KEYS.map(value => ({text: value, value: value}))
        return defaultKeyHeaders.concat(this.keys.map(value => ({text: value, value: value})))
      }
    }
  }
</script>
