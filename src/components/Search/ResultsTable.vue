<template>
  <div>
    <v-card-text>
      <div class="clearfix">
        <v-flex right d-inline-flex>
          <v-text-field id="filter"
                        v-model="filter"
                        title="Filter via 'column:query'"
                        append-icon="search"
                        label="Filter..."
                        name="filter"
                        class="mt-0"
                        @keyup.esc="filter = ''"/>

        </v-flex>
      </div>
    </v-card-text>

    <v-data-table :rows-per-page-items="defaultRowsPerPage()"
                  :headers="headers"
                  :items="flattenedHits"
                  :loading="loading"
                  :search="filter"
                  :custom-filter="callFuzzyTableFilter"
                  :pagination.sync="pagination"
                  class="table--condensed table--fixed-header">
      <template slot="items" slot-scope="item">
        <tr class="tr--clickable" @click="openDocument(item.item)">
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

      <v-progress-linear slot="progress" color="blue" indeterminate/>
    </v-data-table>
  </div>
</template>

<script>
  import { objectArrayUniqueKeys } from '../../helpers/utilities'
  import { fuzzyTableFilter } from '../../helpers/filters'
  import FixedTableHeader from '@/mixins/FixedTableHeader'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import { mapVuexAccessors } from '../../helpers/store'
  import { mapState } from 'vuex'

  export default {
    name: 'ResultsTable',
    mixins: [
      FixedTableHeader
    ],
    props: {
      hits: {
        default: () => {
          return []
        },
        type: Array
      },
      loading: {
        default: false,
        type: Boolean
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
      ...mapVuexAccessors('search', ['filter', 'pagination']),
      ...mapState('search', ['showIndex', 'showScore'])
    },
    mounted () {
      this.fixedTableHeaderOnEnable()
    },
    beforeDestroy () {
      this.fixedTableHeaderOnDisable()
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
    }
  }
</script>
