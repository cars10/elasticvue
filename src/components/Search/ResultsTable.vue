<template>
  <div>
    <v-card-text>
      <div class="clearfix">
        <div class="float-right d-inline-block">
          <v-text-field id="filter"
                        v-model="filter"
                        :loading="filterLoading"
                        append-icon="mdi-magnify"
                        class="mt-0 pt-0 v-text-field--small"
                        hide-details
                        label="Filter *current* page..."
                        name="filter"
                        title="Filter via 'column:query'"
                        @keyup.esc="filter = ''"/>

          <settings-dropdown :badge="columns.length > filteredColumns.length" button-title="Table settings">
            <multi-setting v-model="selectedColumns" :settings="columns" name="Columns"/>
          </settings-dropdown>
        </div>
      </div>
    </v-card-text>

    <v-data-table :footer-props="{itemsPerPageOptions: [10, 20, 100, 1000, 10000]}"
                  :headers="filteredHeaders"
                  :items="filteredItems"
                  :loading="loading || filterLoading"
                  :options.sync="options"
                  :server-items-length="totalHits"
                  class="table--condensed table--fixed-header">
      <template v-slot:item="item">
        <result :document="item.item" :filtered-columns="filteredColumns" @openDocument="openDocument"/>
      </template>

      <template slot="no-data">
        <template v-if="filter !== ''"> No documents found that match your filter <i>{{ filter }}</i>.</template>
        <template v-else>No documents found.</template>
      </template>

      <v-progress-linear slot="progress" color="blue" indeterminate/>
    </v-data-table>
    <modal-data-loader v-model="modalOpen" :method-params="modalMethodParams" method="get"/>
  </div>
</template>

<script>
  import SettingsDropdown from '@/components/shared/TableSettings/SettingsDropdown'
  import MultiSetting from '@/components/shared/TableSettings/MultiSetting'
  import ModalDataLoader from '@/components/shared/ModalDataLoader'
  import Results from '@/models/Results'
  import Result from '@/components/Search/Result'
  import { compositionVuexAccessors } from '@/helpers/store'
  import { useAsyncFilter } from '@/mixins/UseAsyncTableFilter'
  import { debounce, sortableField } from '@/helpers'
  import { computed, ref, watch } from '@vue/composition-api'
  import { useElasticsearchRequest } from '@/mixins/RequestComposition'

  export default {
    name: 'results-table',
    components: {
      SettingsDropdown,
      MultiSetting,
      ModalDataLoader,
      Result
    },
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
    setup (props) {
      const filteredItems = ref([])
      const modalOpen = ref(false)
      const modalMethodParams = ref({})
      const headers = ref([])
      const {
        q,
        filter,
        options,
        selectedColumns,
        columns
      } = compositionVuexAccessors('search', ['q', 'filter', 'options', 'selectedColumns', 'columns'])
      const { filterLoading, asyncFilterTable } = useAsyncFilter()

      const hits = computed(() => {
        if (!props.body) return []
        if (!props.body.hits) return []

        return props.body.hits.hits
      })

      const totalHits = computed(() => {
        if (!props.body) return 0
        if (!props.body.hits) return 0
        if (typeof props.body.hits.total === 'object') return props.body.hits.total.value

        return props.body.hits.total
      })

      const filteredColumns = computed(() => {
        if (columns.value.length === selectedColumns.value.length) {
          return columns.value
        } else {
          return columns.value.filter(k => selectedColumns.value.includes(k))
        }
      })

      const filteredHeaders = computed(() => {
        let newHeaders = []
        if (headers.value.length === selectedColumns.value.length) {
          newHeaders = headers.value
        } else {
          newHeaders = headers.value.filter(h => selectedColumns.value.includes(h.originalValue))
        }

        return newHeaders.concat({
          text: '',
          value: 'actions',
          sortable: false
        })
      })

      const { callElasticsearch } = useElasticsearchRequest()

      watch(hits, val => {
        if (val.length === 0 && hits.value.length === 0) {
          filteredItems.value = []
          return
        }

        const oldColumns = columns.value
        const results = new Results(hits.value)
        columns.value = results.uniqueColumns
        const newColumns = columns.value.filter(m => !oldColumns.includes(m))
        selectedColumns.value = selectedColumns.value.concat(newColumns)
        const resultIndices = results.uniqueIndices

        callElasticsearch('indexGet', { index: resultIndices })
          .then(indices => {
            const allProperties = {}
            Object.keys(indices).forEach(index => {
              const mappings = indices[index].mappings
              if (typeof mappings.properties === 'undefined') {
                // ES < 7
                const indexProperties = {}
                Object.keys(mappings).forEach(mapping => {
                  Object.assign(indexProperties, mappings[mapping].properties)
                })
                Object.assign(allProperties, indexProperties)
              } else {
                // ES >= 7
                Object.assign(allProperties, mappings.properties)
              }
            })

            headers.value = filteredColumns.value.map(value => {
              const filterableCol = sortableField(value, allProperties[value])
              let text

              if (filterableCol) {
                text = value === filterableCol ? value : `${value} (${filterableCol})`
              } else {
                text = value
              }
              return { value: filterableCol, text, sortable: !!filterableCol, originalValue: value }
            })
            filterTable(val, filter.value)
          })
      })

      watch(filter, val => {
        debouncedFilterTable(hits.value, val, val.length === 0)
      })

      const filterTable = async (items, filter) => {
        const filteredResults = await asyncFilterTable(items, filter, filteredColumns.value)
        filteredItems.value = filteredResults.map(el => Object.assign(el, el._source) && delete el._source && el)
      }

      const debouncedFilterTable = debounce(filterTable, 500)

      const openDocument = params => {
        modalMethodParams.value = params
        modalOpen.value = true
      }

      return {
        filterLoading,
        filteredItems,
        hits,
        modalOpen,
        modalMethodParams,
        totalHits,
        filteredColumns,
        filteredHeaders,
        openDocument,
        q,
        filter,
        options,
        columns,
        selectedColumns
      }
    }
  }
</script>
