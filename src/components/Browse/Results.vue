<template>
  <v-card>
    <div class="inline-block px-3 pull-right" style="width: 250px;">
      <v-text-field class=""
                    append-icon="search"
                    label="Filter"
                    v-model="filter"></v-text-field>
    </div>

    <v-data-table :rows-per-page-items="[10, 25, 100, {text: 'All',value:-1}]"
                  :headers="headers"
                  :items="flattenedHits"
                  :loading="loading"
                  :search="filter">
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
