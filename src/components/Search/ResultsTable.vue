<template>
  <div>
    <v-card-text>
      <div class="clearfix">
        <v-flex right d-inline-flex>
          <v-text-field append-icon="search"
                        @keyup.esc="searchFilter = ''"
                        label="Filter results..."
                        messages="Filter via 'column:query'"
                        name="filter"
                        id="filter"
                        class="mt-0"
                        v-model="searchFilter"></v-text-field>
        </v-flex>
      </div>
    </v-card-text>

    <v-data-table :rows-per-page-items="defaultRowsPerPage()"
                  :headers="headers"
                  :items="flattenedHits"
                  :loading="loading"
                  :search="searchFilter"
                  :custom-filter="callFuzzyTableFilter"
                  :pagination.sync="searchPagination"
                  class="table--condensed fixed-header">
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
  import { flattenObject, objectArrayUniqueKeys } from '../../helpers/utilities'
  import { fuzzyTableFilter } from '../../helpers/filters'
  import FixedHeaderTable from '@/mixins/FixedHeaderTable'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'

  const DEFAULT_KEYS = ['_index', '_id', '_type', '_score']

  export default {
    name: 'ResultsTable',
    props: {
      hits: {
        default: () => {
          return []
        },
        type: Array
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
        return this.hits.map(hit => flattenObject(hit))
      },
      searchFilter: {
        get () {
          return this.$store.state.search.filter
        },
        set (filter) {
          this.$store.commit('setSearchFilter', filter)
        }
      },
      searchPagination: {
        get () {
          return this.$store.state.search.pagination
        },
        set (pagination) {
          this.$store.commit('setSearchPagination', pagination)
        }
      }
    },
    methods: {
      openDocument (item) {
        this.$router.push({name: 'Document', params: {index: item._index, type: item._type, id: item._id}})
      },
      callFuzzyTableFilter (items, search, filter, headers) {
        return fuzzyTableFilter(items, search, headers)
      },
      defaultRowsPerPage () {
        return DEFAULT_ROWS_PER_PAGE
      }
    },
    mounted () {
      this.fixedHeaderTableOnMount()
    },
    beforeDestroy () {
      this.fixedHeaderTableOnBeforeDestroy()
    },
    mixins: [
      FixedHeaderTable
    ]
  }
</script>
