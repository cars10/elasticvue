<template>
  <div>
    <v-card-text>
      <div class="clearfix">
        <div class="float-right d-inline-flex">
          <v-text-field id="filter"
                        :loading="filterLoading"
                        v-model="filter"
                        append-icon="mdi-magnify"
                        class="mt-0"
                        hide-details
                        label="Filter..."
                        name="filter"
                        title="Filter via 'column:query'"
                        @keyup.esc="filter = ''"/>

          <settings-dropdown :badge="mappings.length > filteredMappings.length">
            <single-setting v-model="stickyTableHeader" class="mb-1" name="Sticky table header"/>
            <multi-setting :settings="mappings" v-model="selectedMappings" name="Columns"/>
          </settings-dropdown>
        </div>
      </div>
    </v-card-text>

    <v-data-table :class="tableClasses"
                  :footer-props="{itemsPerPageOptions: DEFAULT_ITEMS_PER_PAGE}"
                  :headers="headers"
                  :items="items"
                  :loading="loading"
                  :options.sync="pagination">
      <template v-slot:item="item">
        <tr class="tr--clickable" @click="openDocument(item.item)">
          <td v-for="key in filteredMappings" :key="key">{{item.item[key]}}</td>
          <td>
            <router-link :class="openDocumentClasses"
                         :to="documentRoute(item.item)"
                         event=""
                         title="Show"
                         @click.native.prevent="openDocument(item.item)">
              <div class="v-btn__content">
                Show
              </div>
            </router-link>
          </td>
        </tr>
      </template>

      <template slot="no-data">
        Nothing found.
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
  import { DEFAULT_ITEMS_PER_PAGE } from '../../consts'
  import { mapVuexAccessors } from '../../helpers/store'
  import Results from '../../models/Results'
  import AsyncFilter from '@/mixins/AsyncFilter'

  export default {
    name: 'ResultsTable',
    components: {
      SettingsDropdown,
      SingleSetting,
      MultiSetting,
      ModalDataLoader
    },
    mixins: [AsyncFilter],
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
        items: [],
        modalOpen: false,
        modalMethodParams: {}
      }
    },
    computed: {
      filteredMappings () {
        return this.mappings.filter(k => this.selectedMappings.includes(k))
      },
      headers () {
        return this.filteredMappings.map(value => ({ text: value, value: value })).concat({
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
      openDocumentClasses () {
        return [
          'v-btn',
          'v-size--default',
          { 'theme--dark': this.$store.state.theme.dark },
          { 'theme--light': !this.$store.state.theme.dark }
        ]
      },
      ...mapVuexAccessors('search', ['filter', 'pagination', 'selectedMappings', 'mappings'])
    },
    watch: {
      hits (val) {
        if (val.length === 0 && this.hits.length === 0) return // component creation

        this.callFuzzyTableFilter(val, this.filter, true)
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
    created () {
      this.DEFAULT_ITEMS_PER_PAGE = DEFAULT_ITEMS_PER_PAGE
    },
    methods: {
      async callFuzzyTableFilter (items, filter, skipTimeout) {
        this.debounceFilter(async () => {
          let filteredResults = await this.filterTable(items, filter, this.headers, skipTimeout)
          const oldMappings = this.mappings
          const results = new Results(filteredResults)
          this.mappings = results.uniqueColumns
          const newMappings = this.mappings.filter(m => !oldMappings.includes(m))
          this.selectedMappings = this.selectedMappings.concat(newMappings)
          this.items = results.results
        }, skipTimeout)
      },
      openDocument (item) {
        this.modalMethodParams = { index: item._index, type: item._type, id: item._id }
        this.$nextTick(() => {
          this.modalOpen = true
        })
      },
      documentRoute (item) {
        return { name: 'Document', params: { index: item._index, type: item._type, id: item._id } }
      }
    }
  }
</script>
