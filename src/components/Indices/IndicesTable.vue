<template>
  <div>
    <v-card-text>
      <div class="clearfix">
        <new-index @reloadIndices="emitReloadIndices"/>
        <v-flex right d-inline-flex>
          <v-text-field id="filter"
                        v-model="filter"
                        :loading="filterLoading"
                        append-icon="search"
                        label="Filter..."
                        name="filter"
                        class="mt-0"
                        title="Filter via 'column:query'"
                        autofocus
                        hide-details
                        @keyup.esc="filter = ''"/>

          <settings-dropdown>
            <single-setting v-model="stickyTableHeader" name="Sticky table header" class="mb-1"/>
          </settings-dropdown>
        </v-flex>
      </div>
    </v-card-text>

    <v-data-table :rows-per-page-items="DEFAULT_ROWS_PER_PAGE"
                  :headers="HEADERS"
                  :items="items"
                  :pagination.sync="pagination"
                  :loading="loading"
                  :class="tableClasses">
      <template v-slot:items="props">
        <index-row :index="props.item" @reloadIndices="emitReloadIndices"/>
      </template>
    </v-data-table>
  </div>
</template>

<script>
  import ElasticsearchIndex from '../../models/ElasticsearchIndex'
  import { fixedTableHeaderOnDisable, fixedTableHeaderOnEnable, resetTableHeight } from '@/mixins/FixedTableHeader'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
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
      this.DEFAULT_ROWS_PER_PAGE = DEFAULT_ROWS_PER_PAGE
    },
    methods: {
      async callFuzzyTableFilter (items, filter, skipTimeout) {
        let result = await this.filterTable(items, filter, this.HEADERS, skipTimeout)
        this.items = result.map(index => new ElasticsearchIndex(index))
      },
      emitReloadIndices () {
        this.$emit('reloadIndices')
      }
    }
  }
</script>
