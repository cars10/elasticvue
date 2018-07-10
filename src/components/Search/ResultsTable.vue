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
          <td v-if="showIndex">{{ item.item._index }}</td>
          <td v-if="showScore">{{ item.item._score}}</td>
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
  </div>
</template>

<script>
  import { objectArrayUniqueKeys } from '../../helpers/utilities'
  import { fuzzyTableFilter } from '../../helpers/filters'
  import FixedHeaderTable from '@/mixins/FixedHeaderTable'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'

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
      defaultKeys () {
        let keys = []
        if (this.showIndex) keys.push('_index')
        if (this.showScore) keys.push('_score')
        keys.push('_id')
        keys.push('_type')
        return keys
      },
      headers () {
        let defaultKeyHeaders = this.defaultKeys.map(value => ({text: value, value: value}))
        return defaultKeyHeaders.concat(this.keys.map(value => ({text: value, value: value})))
      },
      keys () {
        return objectArrayUniqueKeys(this.hits, '_source')
      },
      flattenedHits () {
        return this.hits.map(hit => {
          Object.assign(hit, hit['_source'])
          delete hit['_source']
          return hit
        })
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
      },
      showIndex () {
        return this.$store.state.search.showIndex
      },
      showScore () {
        return this.$store.state.search.showScore
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
