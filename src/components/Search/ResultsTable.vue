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
                        hide-details
                        @keyup.esc="filter = ''"/>

          <settings-dropdown :badge="mappings.length > filteredMappings.length">
            <single-setting v-model="stickyTableHeader" name="Sticky table header"/>
            <multi-setting v-model="selectedMappings" :settings="mappings" name="Columns"/>
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
          <td v-for="key in filteredMappings" :key="key">{{item.item[key]}}</td>
          <td>
            <router-link :to="documentRoute(item.item)"
                         :class="openDocumentClasses"
                         title="Show"
                         event=""
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
    <modal-data-loader v-model="modalOpen" :method-params="modalMethodParams" method="get"/>
  </div>
</template>

<script>
  import { fuzzyTableFilter } from '../../helpers/filters'
  import FixedTableHeader from '@/mixins/FixedTableHeader'
  import SettingsDropdown from '@/components/shared/SettingsDropdown'
  import SingleSetting from '@/components/shared/SingleSetting'
  import MultiSetting from '@/components/shared/MultiSetting'
  import ModalDataLoader from '@/components/shared/ModalDataLoader'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import { mapVuexAccessors } from '../../helpers/store'
  import Results from '../../models/Results'

  export default {
    name: 'ResultsTable',
    components: {
      SettingsDropdown,
      SingleSetting,
      MultiSetting,
      ModalDataLoader
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
        settingsBadge: false,
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
          this.resetTableHeight()
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
          'v-btn--router',
          { 'theme--dark': this.$store.state.theme.dark },
          { 'theme--light': !this.$store.state.theme.dark }
        ]
      },
      ...mapVuexAccessors('search', ['filter', 'pagination', 'selectedMappings', 'mappings'])
    },
    watch: {
      hits () {
        const oldMappings = this.mappings
        const results = new Results(this.hits)
        this.mappings = results.uniqueColumns
        const newMappings = this.mappings.filter(m => !oldMappings.includes(m))
        this.selectedMappings = this.selectedMappings.concat(newMappings)
        this.flattenedHits = results.results
      }
    },
    methods: {
      openDocument (item) {
        this.modalMethodParams = { index: item._index, type: item._type, id: item._id }
        this.modalOpen = true
      },
      callFuzzyTableFilter (items, search, filter, headers) {
        return fuzzyTableFilter(items, search, headers)
      },
      defaultRowsPerPage () {
        return DEFAULT_ROWS_PER_PAGE
      },
      documentRoute (item) {
        return { name: 'Document', params: { index: item._index, type: item._type, id: item._id } }
      }
    }
  }
</script>
