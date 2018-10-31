<template>
  <div>
    <v-card-text>
      <div class="clearfix">
        <new-index @reloadIndices="() => this.$emit('reloadIndices')"/>
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
            <single-setting v-model="stickyTableHeader" name="Sticky table header"/>
          </settings-dropdown>
        </v-flex>
      </div>
    </v-card-text>

    <v-data-table :rows-per-page-items="DEFAULT_ROWS_PER_PAGE"
                  :headers="HEADERS"
                  :items="flattenedItems"
                  :custom-sort="sortIndices"
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
          <td class="text-xs-right">{{props.item['docs.count']}}</td>
          <td class="text-xs-right">{{props.item['store.size']}}</td>
          <td class="text-xs-right">{{props.item['pri.store.size']}}</td>
          <td>
            <btn-group small>
              <v-btn title="Search documents" @click.native.stop="showDocuments(props.item.index)">
                <v-icon>search</v-icon>
              </v-btn>

              <v-menu offset-y>
                <v-btn slot="activator" title="Options">
                  <v-icon>settings</v-icon>
                  <v-icon small>arrow_drop_down</v-icon>
                </v-btn>
                <v-list>
                  <list-tile-modal-link
                    :modal-action="() => openModal(props.item.index, 'indicesGet', {index: props.item.index})"
                    :to="linkRoute('Index', {index: props.item.index})"
                    icon="info" link-title="Show info"/>

                  <list-tile-modal-link
                    :modal-action="() => openModal(props.item.index, 'indicesStats', {index: props.item.index} )"
                    :to="linkRoute('IndexStats', {index: props.item.index})"
                    icon="show_chart" link-title="Show stats"/>

                  <v-divider/>

                  <list-tile-link :action="() => forcemergeIndex(props.item.index)"
                                  icon="merge_type" link-title="Forcemerge index"/>

                  <list-tile-link :action="() => refreshIndex(props.item.index)"
                                  icon="refresh" link-title="Refresh index"/>

                  <list-tile-link :action="() => flushIndex(props.item.index)"
                                  icon="save_alt" link-title="Flush index"/>

                  <list-tile-link :action="() => clearCacheIndex(props.item.index)"
                                  icon="clear_all" link-title="Clear index cache"/>

                  <v-divider/>
                  <list-tile-link v-if="props.item.status === 'open'" :action="() => closeIndex(props.item.index)"
                                  icon="lock" link-title="Close index"/>
                  <list-tile-link v-else :action="() => openIndex(props.item.index)"
                                  icon="lock_open" link-title="Open index"/>
                  <list-tile-link :action="() => deleteIndex(props.item.index)"
                                  icon="delete" link-title="Delete index"/>
                </v-list>
              </v-menu>
            </btn-group>
          </td>
        </tr>
      </template>
    </v-data-table>
    <modal-data-loader v-model="modalOpen"
                       :method-params="modalMethodParams"
                       :method="modalMethod"
                       :modal-title="modalTitle"
                       :modal-subtitle="modalSubtitle"/>
  </div>
</template>

<script>
  import BtnGroup from '@/components/shared/BtnGroup'
  import { fuzzyTableFilter } from '../../helpers/filters'
  import { flattenObject } from '../../helpers/utilities'
  import FixedTableHeader from '@/mixins/FixedTableHeader'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import { mapVuexAccessors } from '../../helpers/store'
  import NewIndex from '@/components/Indices/NewIndex'
  import SettingsDropdown from '@/components/shared/SettingsDropdown'
  import SingleSetting from '@/components/shared/SingleSetting'
  import ListTileLink from '@/components/shared/ListTile/ListTileLink'
  import ModalLinkHelper from '@/mixins/ModalLinkHelper'

  export default {
    name: 'IndicesTable',
    components: {
      BtnGroup,
      NewIndex,
      SettingsDropdown,
      SingleSetting,
      ListTileLink
    },
    mixins: [
      FixedTableHeader,
      ModalLinkHelper
    ],
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
      flattenedItems () {
        return this.indices.map(hit => flattenObject(hit, false))
      },
      stickyTableHeader: {
        get () {
          return this.$store.state.indices.stickyTableHeader
        },
        set (value) {
          this.resetTableHeight()
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
    created () {
      this.HEADERS = [
        { text: 'index', value: 'index' },
        { text: 'health', value: 'health' },
        { text: 'status', value: 'status' },
        { text: 'uuid', value: 'uuid' },
        { text: 'pri', value: 'pri', align: 'right' },
        { text: 'rep', value: 'rep', align: 'right' },
        { text: 'docs.count', value: 'docs.count', align: 'right' },
        { text: 'store.size', value: 'store.size', align: 'right' },
        { text: 'pri.store.size', value: 'pri.store.size', align: 'right' },
        { text: '', value: 'actions', sortable: false }
      ]
      this.DEFAULT_ROWS_PER_PAGE = DEFAULT_ROWS_PER_PAGE
    },
    methods: {
      sortIndices (items, index, isDescending) {
        const NUMBER_KIND_VALUES = ['pri', 'rep', 'docs.count', 'store.size', 'pri.store.size']
        return items.sort((a, b) => {
          let valA = a[index]
          let valB = b[index]

          // Parse the values to float because string sorting does not work right here.
          if (NUMBER_KIND_VALUES.includes(index)) {
            valA = parseFloat(a[index])
            valB = parseFloat(b[index])
          }

          if (valA < valB) {
            return isDescending ? 1 : -1
          } else if (valA > valB) {
            return isDescending ? -1 : 1
          } else {
            return 0
          }
        })
      },
      showDocuments (index) {
        this.$store.commit('search/setIndices', [index]) // to pre-select right index on "Search" page
        this.$router.push({ name: 'Search', params: { executeSearch: true } })
      },
      deleteIndex (index) {
        if (confirm('Are you sure? This will remove ALL data in your index!')) {
          this.simpleRequest({
            method: 'indicesDelete',
            args: { index },
            callback: () => this.$emit('reloadIndices'),
            text: `The index '${index}' was successfully deleted.`
          })
        }
      },
      callFuzzyTableFilter (items, search, filter, headers) {
        return fuzzyTableFilter(items, search, headers)
      },
      closeIndex (index) {
        this.simpleRequest({
          method: 'indicesClose',
          args: { index },
          callback: () => this.$emit('reloadIndices'),
          text: `The index '${index}' was successfully closed.`
        })
      },
      openIndex (index) {
        this.simpleRequest({
          method: 'indicesOpen',
          args: { index },
          callback: () => this.$emit('reloadIndices'),
          text: `The index '${index}' was successfully opened.`
        })
      },
      forcemergeIndex (index) {
        this.simpleRequest({
          method: 'indicesForcemerge',
          args: { index },
          callback: () => this.$emit('reloadIndices'),
          text: `The index '${index}' was successfully merged.`
        })
      },
      refreshIndex (index) {
        this.simpleRequest({
          method: 'indicesRefresh',
          args: { index },
          callback: () => this.$emit('reloadIndices'),
          text: `The index '${index}' was successfully refreshed.`
        })
      },
      flushIndex (index) {
        this.simpleRequest({
          method: 'indicesFlush',
          args: { index },
          callback: () => this.$emit('reloadIndices'),
          text: `The index '${index}' was successfully flushed.`
        })
      },
      clearCacheIndex (index) {
        this.simpleRequest({
          method: 'indicesClearCache',
          args: { index },
          callback: () => this.$emit('reloadIndices'),
          text: `The index '${index}' cache was successfully cleared.`
        })
      }
    }
  }
</script>
