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
                  :items="filteredIndices"
                  :loading="loading"
                  :options.sync="options"
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
  import { compositionVuexAccessors } from '@/helpers/store'
  import { useAsyncFilter } from '@/mixins/CompositionAsyncFilter'
  import { ref, watch } from '@vue/composition-api'
  import { debounce } from '@/helpers'

  export default {
    name: 'indices-table',
    components: {
      NewIndex,
      IndexRow
    },
    props: {
      indices: {
        default: () => ([]),
        type: Array
      },
      loading: {
        default: false,
        type: Boolean
      }
    },
    setup (props, context) {
      const { filter, options } = compositionVuexAccessors('indices', ['filter', 'options'])
      const filteredIndices = ref(props.indices)

      const HEADERS = [
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

      const emitReloadIndices = () => {
        context.emit('reloadIndices')
      }

      const { filterTable } = useAsyncFilter()

      const fuzzyTableFilter = async (items, filter) => {
        const result = await filterTable(items, filter, HEADERS)
        filteredIndices.value = result.map(index => new ElasticsearchIndex(index))
      }
      const debouncedFuzzyTableFilter = debounce(fuzzyTableFilter, 500)

      watch(() => props.indices, newValue => {
        if (newValue.length === 0 && props.indices.length === 0) {
          filteredIndices.value = []
          return
        }

        fuzzyTableFilter(newValue, filter.value)
      })

      watch(filter, newValue => {
        debouncedFuzzyTableFilter(props.indices, newValue)
      })

      return {
        filter,
        options,
        filteredIndices,
        HEADERS,
        DEFAULT_ITEMS_PER_PAGE,
        emitReloadIndices
      }
    }
  }
</script>
