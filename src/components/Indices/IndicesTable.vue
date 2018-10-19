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

    <v-data-table :rows-per-page-items="defaultRowsPerPage()"
                  :headers="headers"
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
              <v-btn flat title="Search documents" @click.native.stop="showDocuments(props.item.index)">
                <v-icon>search</v-icon>
              </v-btn>
              <modal-data-loader-activator :to="{ name: 'Index', params: { index: props.item.index } }"
                                           :method-params="{index: props.item.index}"
                                           :modal-subtitle="props.item.index"
                                           activator-title="Show index"
                                           modal-title="Show index"
                                           flat
                                           activator-icon="info_outline"
                                           method="indicesGet"/>
              <v-btn flat title="Delete" @click.native.stop="deleteIndex(props.item.index)">
                <v-icon>delete</v-icon>
              </v-btn>
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
  import { flattenObject } from '../../helpers/utilities'
  import FixedTableHeader from '@/mixins/FixedTableHeader'
  import { DEFAULT_ROWS_PER_PAGE } from '../../consts'
  import { mapVuexAccessors } from '../../helpers/store'
  import NewIndex from '@/components/Indices/NewIndex'
  import SettingsDropdown from '@/components/shared/SettingsDropdown'
  import SingleSetting from '@/components/shared/SingleSetting'
  import ModalDataLoaderActivator from '@/components/shared/ModalDataLoaderActivator'

  export default {
    name: 'IndicesTable',
    components: {
      BtnGroup,
      NewIndex,
      SettingsDropdown,
      SingleSetting,
      ModalDataLoaderActivator
    },
    mixins: [
      FixedTableHeader
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
    data () {
      return {
        rows: [],
        headers: [
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
    mounted () {
      this.fixedTableHeaderOnEnable()
    },
    beforeDestroy () {
      this.fixedTableHeaderOnDisable()
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
          this.getElasticsearchAdapter()
            .then(adapter => adapter.indicesDelete({ index }))
            .then(body => {
              this.$emit('reloadIndices')
              this.showSuccessSnackbar({
                text: `The index '${index}' was successfully deleted.`,
                additionalText: JSON.stringify(body)
              })
            })
            .catch(error => this.$store.commit('connection/setErrorState', error))
        }
      },
      callFuzzyTableFilter (items, search, filter, headers) {
        return fuzzyTableFilter(items, search, headers)
      },
      defaultRowsPerPage () {
        return DEFAULT_ROWS_PER_PAGE
      }
    }
  }
</script>
