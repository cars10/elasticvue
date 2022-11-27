<template>
  <div>
    <v-card-text>
      <v-row>
        <v-col>
          <new-index @reloadIndices="emitReloadIndices"/>
          <router-link :to="{name: 'IndexTemplates'}" class="ml-4">Index templates</router-link>
        </v-col>
        <v-col>
          <div class="float-right d-flex">
            <v-text-field id="filter"
                          v-model="filter"
                          :label="$t('defaults.filter.label')"
                          append-icon="mdi-magnify"
                          autofocus
                          class="mt-0 pt-0 mr-2 v-text-field--small"
                          hide-details
                          name="filter"
                          @keyup.esc="filter = ''"/>
            <settings-dropdown :button-title="$t('search.results_table.settings.title')">
              <single-setting v-model="showHiddenIndices"
                              :name="$t('indices.indices_table.show_hidden_indices.label')"/>
              <single-setting v-model="stickyTableHeader"
                              :name="$t('indices.indices_table.sticky_table_header.label')"/>
            </settings-dropdown>
          </div>
        </v-col>
      </v-row>
    </v-card-text>

    <v-data-table :footer-props="{itemsPerPageOptions: DEFAULT_ITEMS_PER_PAGE, showFirstLastPage: true}"
                  :headers="HEADERS"
                  :items="items"
                  :loading="loading"
                  :options.sync="options"
                  show-select
                  :class="tableClasses">
      <template v-slot:header.data-table-select>
        <v-checkbox class="mt-0"
                    hide-details
                    dense
                    :value="selectedIndices.length === items.length"
                    :indeterminate="selectedIndices.length > 0 && selectedIndices.length < items.length"
                    @change="checkAll"/>
      </template>
      <template v-slot:item="props">
        <index-row :index="props.item" @reloadIndices="emitReloadIndices">
          <template slot="checkbox">
            <v-checkbox class="mt-0" hide-details dense
                        :input-value="selectedIndices.includes(props.item.index)"
                        @change="e => select(props.item.index, e)"/>
          </template>
        </index-row>
      </template>
      <template v-slot:header.parsedDocsCount="{header}">
        {{ header.text }}
        <v-icon :title="$t('indices.indices_table.table.headers.parsed_docs_count.title')" small>
          mdi-information-outline
        </v-icon>
      </template>
      <template v-slot:footer.prepend>
        <index-bulk :selected-indices="selectedIndices"
                    :items-length="items.length"
                    :indices-length="indices.length"
                    :has-filter="filter.length > 0"
                    @reloadIndices="emitReloadIndices"
                    @indicesDeleted="clearDeletedIndicesAndReload"/>
      </template>
      <template v-slot:no-data>
        <template v-if="filter">
          {{ $t('shared.nothing_found_for_filter', { filter }) }}
        </template>
        <template v-else>
          {{ $t('shared.nothing_found') }}
        </template>
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
  import { computed, ref, watch } from 'vue'
  import { useAsyncFilter } from '@/mixins/UseAsyncTableFilter'
  import { debounce } from '@/helpers'
  import IndexBulk from '@/components/Indices/IndexBulk'
  import SettingsDropdown from '@/components/shared/TableSettings/SettingsDropdown'
  import SingleSetting from '@/components/shared/TableSettings/SingleSetting'

  export default {
    name: 'indices-table',
    components: {
      NewIndex,
      IndexRow,
      IndexBulk,
      SettingsDropdown,
      SingleSetting
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
        hideIndicesRegex,
        stickyTableHeader
      } = vuexAccessors('indices', ['filter', 'options', 'showHiddenIndices', 'hideIndicesRegex', 'stickyTableHeader'])

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

      const emitReloadIndices = () => (context.emit('reloadIndices'))

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

      const selectedIndices = ref([])
      const select = (index, added) => {
        if (added) {
          selectedIndices.value.push(index)
        } else {
          selectedIndices.value.splice(selectedIndices.value.indexOf(index), 1)
        }
      }
      const checkAll = val => {
        if (val) {
          selectedIndices.value = items.value.map(i => i.index)
        } else {
          selectedIndices.value = []
        }
      }

      const clearDeletedIndicesAndReload = () => {
        selectedIndices.value = []
        emitReloadIndices()
      }

      const tableClasses = computed(() => {
        return {
          'table--condensed': true,
          'table--fixed-header': stickyTableHeader.value
        }
      })

      return {
        checkAll,
        select,
        selectedIndices,
        filter,
        options,
        showHiddenIndices,
        stickyTableHeader,
        tableClasses,
        items,
        HEADERS,
        DEFAULT_ITEMS_PER_PAGE,
        emitReloadIndices,
        clearDeletedIndicesAndReload
      }
    }
  }
</script>
