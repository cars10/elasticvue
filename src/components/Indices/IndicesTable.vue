<template>
  <div>
    <v-card-text>
      <v-row>
        <v-col>
          <new-index @reloadIndices="emitReloadIndices"/>
        </v-col>
        <v-col>
          <div class="d-inline-block float-right">
            <v-text-field id="filter"
                          :loading="filterLoading"
                          v-model="filter"
                          append-icon="mdi-magnify"
                          autofocus
                          class="mt-0 pt-0 v-text-field--small"
                          hide-details
                          label="Filter..."
                          name="filter"
                          title="Filter via 'column:query'"
                          @keyup.esc="filter = ''"/>
          </div>
        </v-col>
      </v-row>
    </v-card-text>

    <v-data-table :footer-props="{itemsPerPageOptions: DEFAULT_ITEMS_PER_PAGE}"
                  :headers="HEADERS"
                  :items="items"
                  :loading="loading"
                  :options.sync="pagination"
                  class="table--condensed table--fixed-header">
      <template v-slot:item="props">
        <index-row :index="props.item" @reloadIndices="emitReloadIndices"/>
      </template>
    </v-data-table>
  </div>
</template>

<script>
  import IndexRow from '@/components/Indices/IndexRow'
  import NewIndex from '@/components/Indices/NewIndex'
  import ElasticsearchIndex from '@/models/ElasticsearchIndex'
  import { DEFAULT_ITEMS_PER_PAGE } from '@/consts'
  import { mapVuexAccessors } from '@/helpers/store'
  import AsyncFilter from '@/mixins/AsyncFilter'
  import { updateFixedTableHeaderHeight } from '@/mixins/FixedTableHeader'

  export default {
    name: 'IndicesTable',
    components: {
      NewIndex,
      IndexRow
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
      ...mapVuexAccessors('indices', ['filter', 'pagination'])
    },
    watch: {
      indices (val) {
        if (val.length === 0 && this.indices.length === 0) {
          this.items = []
          return
        }

        this.callFuzzyTableFilter(val, this.filter, true)
      },
      filter (val) {
        this.callFuzzyTableFilter(this.indices, val, val.length === 0)
      },
      pagination () {
        updateFixedTableHeaderHeight()
      }
    },
    created () {
      this.HEADERS = [
        { text: 'Name', value: 'index' },
        { text: 'Health', value: 'health' },
        { text: 'Status', value: 'status' },
        { text: 'UUID', value: 'uuid' },
        { text: 'Aliases', value: 'aliases', sortable: false },
        { text: 'Shards', value: 'parsedPri', align: 'right' },
        { text: 'Docs', value: 'parsedDocsCount', align: 'right' },
        { text: 'Storage', value: 'parsedStoreSize', align: 'right' },
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
