<template>
  <div>
    <v-card-text>
      <v-flex right d-inline-flex>
        <v-text-field append-icon="search"
                      v-on:keyup.esc="searchFilter = ''"
                      label="Filter via 'column:query'"
                      name="filter"
                      id="filter"
                      v-model="searchFilter"></v-text-field>
      </v-flex>
    </v-card-text>

    <v-data-table :rows-per-page-items="[10, 20, 100, {text: 'All',value:-1}]"
                  :headers="headers"
                  :items="flattenedHits"
                  :loading="loading"
                  :search="searchFilter"
                  :custom-filter="callFuzzyTableFilter"
                  class="table--condensed">
      <template slot="items" slot-scope="item">
        <tr @click="openDocument(item.item)" class="tr--clickable">
          <td>{{ item.item._index }}</td>
          <td>{{ item.item._id}}</td>
          <td>{{ item.item._type}}</td>
          <td>{{ item.item._score}}</td>
          <td v-for="key in keys" :key="item.item._index + '_' + key">{{item.item[key]}}</td>
        </tr>
      </template>

      <template slot="no-data">
        Nothing found.
      </template>

      <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
    </v-data-table>
  </div>
</template>

<script>
  import { flattenObjectAndStringifyValues, objectArrayUniqueKeys } from '../../helpers/utilities'
  import { fuzzyTableFilter } from '../../helpers/filters'

  const DEFAULT_KEYS = ['_index', '_id', '_type', '_score']

  export default {
    name: 'ResultsTable',
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
    computed: {
      headers () {
        let defaultKeyHeaders = DEFAULT_KEYS.map(value => ({text: value, value: value}))
        return defaultKeyHeaders.concat(this.keys.map(value => ({text: value, value: value})))
      },
      keys () {
        return objectArrayUniqueKeys(this.hits, '_source')
      },
      flattenedHits () {
        return this.hits.map(hit => flattenObjectAndStringifyValues(hit))
      },
      searchFilter: {
        get () {
          return this.$store.state.search.filter
        },
        set (filter) {
          this.$store.commit('setSearchFilter', filter)
        }
      }
    },
    methods: {
      openDocument (item) {
        this.$router.push({name: 'Document', params: {index: item._index, type: item._type, id: item._id}})
      },
      callFuzzyTableFilter (items, search, filter, headers) {
        return fuzzyTableFilter(items, search, filter, headers)
      }
    }
  }
</script>
