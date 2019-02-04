<template>
  <div>
    <v-card-text>
      <div class="clearfix">
        <new-index @reloadIndices="emitReloadIndices"/>
        <v-flex right d-inline-flex>
          <v-text-field id="filter"
                        v-model="filter"
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
                  :custom-filter="callFuzzyTableFilter"
                  :pagination.sync="pagination"
                  :search="filter"
                  :loading="loading"
                  :class="tableClasses">
      <template slot="items" slot-scope="props">
        <tr>
          <td>{{props.item.index}}</td>
          <td>{{props.item.health}}</td>
          <td>{{props.item.status}}</td>
          <td>{{props.item.uuid}}</td>
          <td class="text-xs-right">{{props.item.pri}}</td>
          <td class="text-xs-right">{{props.item.rep}}</td>
          <td class="text-xs-right">{{props.item.docsCount}}</td>
          <td class="text-xs-right">{{props.item.storeSize}}</td>
          <td class="text-xs-right">{{props.item.priStoreSize}}</td>
          <td>
            <btn-group small>
              <v-btn title="Search documents" @click.native.stop="showDocuments(props.item.index)">
                <v-icon>search</v-icon>
              </v-btn>

              <v-menu offset-y left>
                <v-btn slot="activator" title="Options">
                  <v-icon>settings</v-icon>
                  <v-icon small>arrow_drop_down</v-icon>
                </v-btn>
                <v-list>
                  <list-tile-modal-link :action="() => openIndicesGetModal(props.item.index)"
                                        :to="{name: 'Index', params: {index: props.item.index}}"
                                        icon="info" link-title="Show info"/>

                  <list-tile-modal-link :action="() => openIndicesStatsModal(props.item.index)"
                                        :to="{name: 'IndexStats', params: {index: props.item.index}}"
                                        icon="show_chart" link-title="Show stats"/>

                  <v-divider/>

                  <list-tile-link :method-params="{index: props.item.index}" :callback="emitReloadIndices"
                                  :growl="`The index '${props.item.index}' was successfully merged.`"
                                  method="indicesForcemerge" icon="merge_type" link-title="Forcemerge index"/>

                  <list-tile-link :method-params="{index: props.item.index}" :callback="emitReloadIndices"
                                  :growl="`The index '${props.item.index}' was successfully refreshed.`"
                                  method="indicesRefresh" icon="refresh" link-title="Refresh index"/>

                  <list-tile-link :method-params="{index: props.item.index}" :callback="emitReloadIndices"
                                  :growl="`The index '${props.item.index}' was successfully flushed.`"
                                  method="indicesFlush" icon="save_alt" link-title="Flush index"/>

                  <list-tile-link :method-params="{index: props.item.index}" :callback="emitReloadIndices"
                                  :growl="`The index '${props.item.index}' cache was successfully cleared.`"
                                  method="indicesClearCache" icon="clear_all" link-title="Clear index cache"/>

                  <v-divider/>

                  <list-tile-link v-if="props.item.status === 'open'"
                                  :method-params="{index: props.item.index}" :callback="emitReloadIndices"
                                  :growl="`The index '${props.item.index}' was successfully closed.`"
                                  method="indicesClose" icon="lock" link-title="Close index"/>
                  <list-tile-link v-else :method-params="{index: props.item.index}" :callback="emitReloadIndices"
                                  :growl="`The index '${props.item.index}' was successfully opened.`"
                                  method="indicesOpen" icon="lock_open" link-title="Open index"/>

                  <list-tile-link :method-params="{index: props.item.index}" :callback="emitReloadIndices"
                                  :growl="`The index '${props.item.index}' was successfully deleted.`"
                                  confirm-message="Are you sure? This will remove ALL data in your index!"
                                  method="indicesDelete" icon="delete" link-title="Delete index"/>
                </v-list>
              </v-menu>
            </btn-group>
          </td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script>
  import BtnGroup from '@/components/shared/BtnGroup'
  import { fuzzyTableFilter } from '../../helpers/filters'
  import { fixedTableHeaderOnDisable, fixedTableHeaderOnEnable, resetTableHeight } from '@/mixins/FixedTableHeader'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import { mapVuexAccessors } from '../../helpers/store'
  import NewIndex from '@/components/Indices/NewIndex'
  import SettingsDropdown from '@/components/shared/SettingsDropdown'
  import SingleSetting from '@/components/shared/SingleSetting'
  import ListTileLink from '@/components/shared/ListTile/ListTileLink'
  import ListTileModalLink from '@/components/shared/ListTile/ListTileModalLink'
  import ElasticsearchIndex from '../../models/ElasticsearchIndex'
  import { openModal } from '@/mixins/OpenModal'

  export default {
    name: 'IndicesTable',
    components: {
      BtnGroup,
      NewIndex,
      SettingsDropdown,
      SingleSetting,
      ListTileLink,
      ListTileModalLink
    },
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
    computed: {
      items () {
        return this.indices.map(index => new ElasticsearchIndex(index))
      },
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
      showDocuments (index) {
        this.$store.commit('search/setIndices', [index]) // to pre-select right index on "Search" page
        this.$router.push({ name: 'Search', params: { executeSearch: true } })
      },
      callFuzzyTableFilter (items, search, filter, headers) {
        return fuzzyTableFilter(items, search, headers)
      },
      emitReloadIndices () {
        this.$emit('reloadIndices')
      },
      openIndicesGetModal (indexName) {
        openModal({
          method: 'indicesGet',
          methodParams: { index: indexName },
          title: 'indicesGet',
          subtitle: indexName
        })
      },
      openIndicesStatsModal (indexName) {
        openModal({
          method: 'indicesStats',
          methodParams: { index: indexName },
          title: 'indicesStats',
          subtitle: indexName
        })
      }
    }
  }
</script>
