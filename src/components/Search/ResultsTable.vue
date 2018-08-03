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

          <settings-dropdown :badge="keys.length > filteredKeys.length">
            <single-setting v-model="stickyTableHeader" name="Sticky table header"/>
            <multi-setting v-model="selectedKeys" :settings="keys" name="Columns"/>
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
          <td v-for="key in filteredKeys" :key="key">{{item.item[key]}}</td>
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
  import MultiSetting from '@/components/shared/MultiSetting'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import { mapVuexAccessors } from '../../helpers/store'
  import Results from '../../models/Results'

  export default {
    name: 'ResultsTable',
    components: {
      SettingsDropdown,
      SingleSetting,
      MultiSetting
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
        settingsBadge: false
      }
    },
    computed: {
      filteredKeys () {
        return this.keys.filter(k => this.selectedKeys.includes(k))
      },
      headers () {
        return this.filteredKeys.map(value => ({text: value, value: value}))
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
      ...mapVuexAccessors('search', ['filter', 'pagination', 'selectedKeys'])
    },
    watch: {
      hits () {
        const oldKeys = this.keys
        const results = new Results(this.hits)
        this.keys = results.uniqueColumns
        // if (this.selectedKeys.length === 0) {
        //   this.selectedKeys = this.keys
        // }
        this.selectedKeys = this.selectedKeys.concat(this.keys.filter(k => !oldKeys.includes(k)))
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
