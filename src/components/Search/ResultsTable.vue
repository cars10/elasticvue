<template>
  <div>
    <v-card-text>
      <div class="clearfix">
        <v-flex right d-inline-flex>
          <v-text-field id="filter"
                        v-model="filter"
                        :disabled="flattenedHits.length === 0"
                        title="Filter via 'column:query'"
                        append-icon="search"
                        label="Filter..."
                        name="filter"
                        class="mt-0"
                        @keyup.esc="filter = ''"/>

          <settings-dropdown>
            <single-setting v-model="stickyTableHeader" name="Sticky table header"/>
          </settings-dropdown>
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
                  :class="tableClasses">
      <template slot="items" slot-scope="item">
        <tr class="tr--clickable" @click="openDocument(item.item)">
          <td v-for="key in keys" :key="key">{{item.item[key]}}</td>
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
  import { fuzzyTableFilter } from '../../helpers/filters'
  import FixedTableHeader from '@/mixins/FixedTableHeader'
  import SettingsDropdown from '@/components/shared/SettingsDropdown'
  import SingleSetting from '@/components/shared/SingleSetting'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import { mapVuexAccessors } from '../../helpers/store'
  import { mapState } from 'vuex'
  import Results from '../../models/Results'

  export default {
    name: 'ResultsTable',
    components: {
      SettingsDropdown,
      SingleSetting
    },
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
    data () {
      return {
        flattenedHits: [],
        keys: [],
        filterTimer: null
      }
    },
    computed: {
      headers () {
        return this.keys.map(value => ({text: value, value: value}))
      },
      stickyTableHeader: {
        get () {
          return this.$store.state.search.stickyTableHeader
        },
        set (value) {
          this.resetTableHeight()
          this.$store.commit('search/setStickyTableHeader', value)
        }
      },
      tableClasses () {
        return [
          'table--condensed',
          {'table--fixed-header': this.stickyTableHeader}
        ]
      },
      ...mapVuexAccessors('search', ['filter', 'pagination']),
      ...mapState('search', ['showIndex', 'showScore'])
    },
    watch: {
      hits () {
        const results = new Results(this.hits)
        this.keys = results.uniqueColumns
        this.flattenedHits = results.results
      }
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
