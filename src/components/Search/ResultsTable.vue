<template>
  <div>
    <v-card-text>
      <div class="clearfix">
        <span class="grey--text">Showing results for: <span class="font--mono">"{{ q }}"</span></span>
        <div class="float-right d-inline-block">
          <v-text-field id="filter"
                        :loading="filterLoading"
                        v-model="filter"
                        append-icon="mdi-magnify"
                        class="mt-0 pt-0 v-text-field--small"
                        hide-details
                        label="Filter *current* page..."
                        name="filter"
                        title="Filter via 'column:query'"
                        @keyup.esc="filter = ''"/>

          <settings-dropdown :badge="columns.length > filteredColumns.length">
            <single-setting v-model="stickyTableHeader" class="mb-1" name="Sticky table header"/>
            <multi-setting :settings="columns" v-model="selectedColumns" name="Columns"/>
          </settings-dropdown>
        </div>
      </div>
    </v-card-text>

    <v-data-table :class="tableClasses"
                  :footer-props="{itemsPerPageOptions: [10, 20, 100, 1000, 10000]}"
                  :headers="filteredHeaders"
                  :items="items"
                  :server-items-length="totalHits"
                  :loading="loading || filterLoading"
                  :options.sync="options">
      <template v-slot:item="item">
        <result :filtered-columns="filteredColumns" :document="item.item" @openDocument="openDocument"/>
      </template>

      <template slot="no-data">
        <template v-if="q !== '*' && filter !== ''">
          No entries found that match your search <i>{{ q }}</i> and your filter <i>{{ filter }}</i>.
        </template>
        <template v-else-if="q !== '*'"> No entries found that match your search <i>{{ q }}</i>.</template>
        <template v-else-if="filter !== ''"> No entries found that match your filter <i>{{ filter }}</i>.</template>
        <template v-else>Nothing found.</template>
      </template>

      <v-progress-linear slot="progress" color="blue" indeterminate/>
    </v-data-table>
    <modal-data-loader :method-params="modalMethodParams" v-model="modalOpen" method="get"/>
  </div>
</template>

<script>
  import { fixedTableHeaderOnDisable, fixedTableHeaderOnEnable, resetTableHeight } from '@/mixins/FixedTableHeader'
  import SettingsDropdown from '@/components/shared/TableSettings/SettingsDropdown'
  import SingleSetting from '@/components/shared/TableSettings/SingleSetting'
  import MultiSetting from '@/components/shared/TableSettings/MultiSetting'
  import ModalDataLoader from '@/components/shared/ModalDataLoader'
  import { mapVuexAccessors } from '@/helpers/store'
  import Results from '../../models/Results'
  import AsyncFilter from '@/mixins/AsyncFilter'
  import { mapState } from 'vuex'
  import esAdapter from '../../mixins/GetAdapter'
  import { sortableField } from '@/helpers'
  import Result from '@/components/Search/Result'

  export default {
    name: 'ResultsTable',
    components: {
      SettingsDropdown,
      SingleSetting,
      MultiSetting,
      ModalDataLoader,
      Result
    },
    mixins: [AsyncFilter],
    props: {
      body: {
        default: () => ({}),
        type: Object
      },
      loading: {
        default: false,
        type: Boolean
      }
    },
    data () {
      return {
        items: [],
        modalOpen: false,
        modalMethodParams: {},
        headers: []
      }
    },
    computed: {
      hits () {
        if (!this.body) return []
        if (!this.body.hits) return []

        return this.body.hits.hits
      },
      totalHits () {
        if (!this.body) return 0
        if (!this.body.hits) return 0
        if (typeof this.body.hits.total === 'object') return this.body.hits.total.value

        return this.body.hits.total
      },
      filteredColumns () {
        if (this.columns.length === this.selectedColumns.length) {
          return this.columns
        } else {
          return this.columns.filter(k => this.selectedColumns.includes(k))
        }
      },
      filteredHeaders () {
        let headers = []
        if (this.headers.length === this.selectedColumns.length) {
          headers = this.headers
        } else {
          headers = this.headers.filter(h => this.selectedColumns.includes(h.originalValue))
        }

        return headers.concat({
          text: '',
          value: 'actions',
          sortable: false
        })
      },
      stickyTableHeader: {
        get () {
          return this.$store.state.search.stickyTableHeader
        },
        set (value) {
          if (!value) resetTableHeight()
          this.$store.commit('search/setStickyTableHeader', value)
        }
      },
      tableClasses () {
        return [
          'table--condensed',
          { 'table--fixed-header': this.stickyTableHeader }
        ]
      },
      ...mapVuexAccessors('search', ['filter', 'options', 'selectedColumns', 'columns']),
      ...mapState('search', ['q'])
    },
    watch: {
      hits (val) {
        if (val.length === 0 && this.hits.length === 0) {
          this.items = []
          return
        }

        const oldColumns = this.columns
        const results = new Results(this.hits)
        this.columns = results.uniqueColumns
        const newColumns = this.columns.filter(m => !oldColumns.includes(m))
        this.selectedColumns = this.selectedColumns.concat(newColumns)
        const resultIndices = results.uniqueIndices

        esAdapter().indexGet({ index: resultIndices })
          .then(data => {
            data.json().then(indices => {
              const allProperties = {}
              Object.keys(indices).forEach(index => {
                const mappings = indices[index].mappings
                if (typeof mappings.properties === 'undefined') {
                  // ES < 7
                  let indexProperties = {}
                  Object.keys(mappings).forEach(mapping => {
                    Object.assign(indexProperties, mappings[mapping].properties)
                  })
                  Object.assign(allProperties, indexProperties)
                } else {
                  // ES >= 7
                  Object.assign(allProperties, mappings.properties)
                }
              })

              this.headers = this.filteredColumns.map(value => {
                let filterableCol = sortableField(value, allProperties[value])
                let text

                if (filterableCol) {
                  text = value === filterableCol ? value : `${value} (${filterableCol})`
                } else {
                  text = value
                }
                return { value: filterableCol, text, sortable: !!filterableCol, originalValue: value }
              })
              this.callFuzzyTableFilter(val, this.filter, true)
            })
          })
      },
      filter (val) {
        this.callFuzzyTableFilter(this.hits, val, val.length === 0)
      }
    },
    mounted () {
      fixedTableHeaderOnEnable()
    },
    beforeDestroy () {
      fixedTableHeaderOnDisable()
    },
    methods: {
      async callFuzzyTableFilter (items, filter, skipTimeout) {
        this.debounceFilter(async () => {
          let filteredResults = await this.filterTable(items, filter, this.filteredColumns, skipTimeout)
          this.items = filteredResults.map(el => Object.assign(el, el._source) && delete el._source && el)
        }, skipTimeout)
      },
      openDocument (params) {
        this.modalMethodParams = params
        this.$nextTick(() => {
          this.modalOpen = true
        })
      }
    }
  }
</script>
