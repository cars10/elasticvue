<template>
  <div>
    <v-card-text>
      <div class="clearfix">
        <new-index @reloadIndices="emitReloadIndices"/>
        <v-col class="float-right d-inline-flex">
          <v-text-field id="filter"
                        :loading="filterLoading"
                        v-model="filter"
                        append-icon="mdi-magnify"
                        autofocus
                        class="mt-0"
                        hide-details
                        label="Filter..."
                        name="filter"
                        title="Filter via 'column:query'"
                        @keyup.esc="filter = ''"/>

          <settings-dropdown>
            <single-setting v-model="stickyTableHeader" class="mb-1" name="Sticky table header"/>
          </settings-dropdown>
        </v-col>
      </div>
    </v-card-text>

    <v-data-table :class="tableClasses"
                  :footer-props="{itemsPerPageOptions: DEFAULT_ITEMS_PER_PAGE}"
                  :headers="HEADERS"
                  :items="items"
                  :loading="loading"
                  :options.sync="pagination">
      <template v-slot:item="props">
        <index-row :index="props.item" @reloadIndices="emitReloadIndices"/>
      </template>
    </v-data-table>
  </div>
</template>

<script>
  import ElasticsearchIndex from '../../models/ElasticsearchIndex'
  import { fixedTableHeaderOnDisable, fixedTableHeaderOnEnable, resetTableHeight } from '@/mixins/FixedTableHeader'
  import { DEFAULT_ITEMS_PER_PAGE } from '../../consts'
  import { mapVuexAccessors } from '../../helpers/store'
  import IndexRow from '@/components/Indices/IndexRow'
  import NewIndex from '@/components/Indices/NewIndex'
  import SettingsDropdown from '@/components/shared/TableSettings/SettingsDropdown'
  import SingleSetting from '@/components/shared/TableSettings/SingleSetting'
  import AsyncFilter from '@/mixins/AsyncFilter'

  export default {
    name: 'IndicesTable',
    components: {
      NewIndex,
      IndexRow,
      SettingsDropdown,
      SingleSetting
    },
    mixins: [AsyncFilter],
    props: {
      indices: {
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
        items: []
      }
    },
    computed: {
      stickyTableHeader: {
        get () {
          return this.$store.state.indices.stickyTableHeader
        },
        set (value) {
          if (!value) resetTableHeight()
          this.$store.commit('indices/setStickyTableHeader', value)
        }
      },
      tableClasses () {
        return [
          'table--condensed',
          { 'table--fixed-header': this.stickyTableHeader }
        ]
      },
      ...mapVuexAccessors('indices', ['filter', 'pagination'])
    },
    watch: {
      indices (val) {
        if (val.length === 0 && this.indices.length === 0) return // component creation

        this.callFuzzyTableFilter(val, this.filter, true)
      },
      filter (val) {
        this.callFuzzyTableFilter(this.indices, val, val.length === 0)
      }
    },
    mounted () {
      fixedTableHeaderOnEnable()
    },
    beforeDestroy () {
      fixedTableHeaderOnDisable()
    },
    created () {
      this.HEADERS = [
        { text: 'index', value: 'index' },
        { text: 'health', value: 'health' },
        { text: 'status', value: 'status' },
        { text: 'uuid', value: 'uuid' },
        { text: 'pri', value: 'parsedPri', align: 'right' },
        { text: 'rep', value: 'parsedRep', align: 'right' },
        { text: 'docs.count', value: 'parsedDocsCount', align: 'right' },
        { text: 'store.size', value: 'parsedStoreSize', align: 'right' },
        { text: 'pri.store.size', value: 'parsedPriStoreSize', align: 'right' },
        { text: '', value: 'actions', sortable: false }
      ]
      this.DEFAULT_ITEMS_PER_PAGE = DEFAULT_ITEMS_PER_PAGE
    },
    methods: {
      async callFuzzyTableFilter (items, filter, skipTimeout) {
        this.debounceFilter(async () => {
          let result = await this.filterTable(items, filter, this.HEADERS, skipTimeout)
          this.items = result.map(index => new ElasticsearchIndex(index))
        }, skipTimeout)
      },
      emitReloadIndices () {
        this.$emit('reloadIndices')
      }
    }
  }
</script>
