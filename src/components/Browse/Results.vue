<template>
  <v-card>
    <div class="inline-block px-3 pull-right" style="width: 250px;">
      <v-text-field class=""
                    append-icon="search"
                    label="Filter via column:query"
                    v-model="filter"></v-text-field>
    </div>

    <v-data-table :rows-per-page-items="[10, 20, 100, {text: 'All',value:-1}]"
                  :headers="headers"
                  :items="flattenedHits"
                  :loading="loading"
                  :search="filter"
                  :customFilter="customTableFilter"
                  class="table__condensed">
      <template slot="items" slot-scope="item">
        <tr @click="openDocument(item.item)">
          <td>{{ item.item._index }}</td>
          <td>{{ item.item._id}}</td>
          <td>{{ item.item._type}}</td>
          <td v-for="key in keys" :key="item.item._index + '_' + key">{{item.item[key]}}</td>
        </tr>
      </template>

      <template slot="no-data">
        Nothing found.
      </template>

      <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
    </v-data-table>
  </v-card>
</template>

<script>
  import { flattenObject, objectArrayUniqueKeys } from '../../helpers/utilities'

  const DEFAULT_KEYS = ['_index', '_id', '_type']

  export default {
    props: {
      hits: {
        default: () => {
          return []
        }
      },
      loading: {
        default: false
      }
    },
    data () {
      return {
        filter: ''
      }
    },
    methods: {
      openDocument (item) {
        this.$router.push({name: 'Document', params: {index: item._index, type: item._type, id: item._id}})
      },
      customTableFilter (items, search, filter, headers) {
        search = search.toString().toLowerCase()
        if (search.trim() === '') return items

        const props = headers.map(h => h.value)
        const searchSplit = search.split(':')

        if (searchSplit.length > 1 && props.includes(searchSplit[0])) {
          const column = searchSplit[0]
          const query = searchSplit[1]
          return items.filter(item => filter(item[column], query))
        } else {
          return items.filter(item => props.some(prop => filter(item[prop], search)))
        }
      }
    },
    computed: {
      headers () {
        let defaultKeyHeaders = DEFAULT_KEYS.map(value => ({text: value, value: value}))
        return defaultKeyHeaders.concat(this.keys.map(value => ({text: value, value: value})))
      },
      keys () {
        return objectArrayUniqueKeys(this.hits, '_source')
      },
      flattenedHits () {
        return this.hits.map((hit) => flattenObject(hit))
      }
    }
  }
</script>
