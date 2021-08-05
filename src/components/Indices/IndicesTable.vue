<template>
  <div>
    <v-card-text>
      <v-row>
        <v-col>
          <new-index @reloadIndices="emitReloadIndices"/>
        </v-col>
        <v-col>
          <div class="d-inline-block float-right">
            <v-checkbox v-model="showHiddenIndices"
                        :label="$t('indices.indices_table.show_hidden_indices.label')"
                        class="d-inline-block mr-6 vertical-align--bottom"
                        hide-details/>
            <v-text-field id="filter"
                          v-model="filter"
                          :label="$t('defaults.filter.label')"
                          append-icon="mdi-magnify"
                          autofocus
                          class="mt-0 pt-0 v-text-field--small"
                          hide-details
                          name="filter"
                          @keyup.esc="filter = ''"/>
          </div>
        </v-col>
      </v-row>
    </v-card-text>

    <v-data-table :footer-props="{itemsPerPageOptions: DEFAULT_ITEMS_PER_PAGE, showFirstLastPage: true}"
                  :headers="HEADERS"
                  :items="items"
                  :loading="loading"
                  :options.sync="options"
                  class="table--condensed table--fixed-header">
      <template v-slot:item="props">
        <index-row :index="props.item" @reloadIndices="emitReloadIndices"/>
      </template>
      <template v-slot:header.parsedDocsCount="{header}">
        {{ header.text }}
        <v-icon :title="$t('indices.indices_table.table.headers.parsed_docs_count.title')" small>
          mdi-information-outline
        </v-icon>
      </template>
    </v-data-table>
  </div>
</template>

<script>
  import IndexRow from '@/components/Indices/IndexRow'
  import NewIndex from '@/components/Indices/NewIndex'
  import ElasticsearchIndex from '@/models/ElasticsearchIndex'
  import i18n from '@/i18n'
  import { DEFAULT_ITEMS_PER_PAGE } from '@/consts'
  import { vuexAccessors } from '@/helpers/store'
  import { ref, watch } from '@vue/composition-api'
  import { useAsyncFilter } from '@/mixins/UseAsyncTableFilter'
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
      const {
        filter,
        options,
        showHiddenIndices,
        hideIndicesRegex
      } = vuexAccessors('indices', ['filter', 'options', 'showHiddenIndices', 'hideIndicesRegex'])

      const HEADERS = [
        { text: i18n.t('indices.indices_table.table.headers.name'), value: 'index' },
        { text: i18n.t('indices.indices_table.table.headers.health'), value: 'health' },
        { text: i18n.t('indices.indices_table.table.headers.status'), value: 'status' },
        { text: i18n.t('indices.indices_table.table.headers.uuid'), value: 'uuid' },
        { text: i18n.t('indices.indices_table.table.headers.aliases'), value: 'aliases', sortable: false },
        { text: i18n.t('indices.indices_table.table.headers.shards'), value: 'parsedPri', align: 'right' },
        { text: i18n.t('indices.indices_table.table.headers.docs'), value: 'parsedDocsCount', align: 'right' },
        { text: i18n.t('indices.indices_table.table.headers.storage'), value: 'parsedStoreSize', align: 'right' },
        { text: '', value: 'actions', sortable: false }
      ]

      const emitReloadIndices = () => {
        context.emit('reloadIndices')
      }

      const items = ref([])
      const { asyncFilterTable } = useAsyncFilter()
      const filterTable = async () => {
        let results = props.indices
        if (!showHiddenIndices.value) {
          results = results.filter(item => !item.index.match(new RegExp(hideIndicesRegex.value)))
        }

        results = await asyncFilterTable(results, filter.value, ['index', 'uuid'])
        items.value = results.map(index => new ElasticsearchIndex(index))
      }
      const debouncedFilterTable = debounce(filterTable, 250)
      watch(filter, debouncedFilterTable)
      watch(showHiddenIndices, filterTable)
      watch(() => props.indices, filterTable)

      return {
        filter,
        options,
        showHiddenIndices,
        items,
        HEADERS,
        DEFAULT_ITEMS_PER_PAGE,
        emitReloadIndices
      }
    }
  }
</script>
