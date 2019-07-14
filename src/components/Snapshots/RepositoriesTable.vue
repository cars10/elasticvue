<template>
  <div>
    <v-card-text>
      <div class="clearfix">
        <new-repository @reloadData="emitReloadData"/>
        <v-flex right d-inline-flex>
          <v-text-field id="filter"
                        v-model="filter"
                        append-icon="mdi-magnify"
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

    <v-data-table ref="repositoriesDataTable"
                  :footer-props="{itemsPerPageOptions: DEFAULT_ITEMS_PER_PAGE}"
                  :headers="HEADERS"
                  :items="items"
                  :custom-filter="callFuzzyTableFilter"
                  :options.sync="pagination"
                  :search="filter"
                  :loading="loading"
                  :class="tableClasses"
                  item-key="name">
      <template v-slot:item="props">
        <tr class="tr--clickable" @click="() => expandRepository(props)">
          <td>
            <v-icon v-if="props.expand.props.value">mdi-chevron-up</v-icon>
            <v-icon v-else>mdi-chevron-down</v-icon>
          </td>
          <td>{{props.item.name}}</td>
          <td>{{props.item.type}}</td>
          <td>{{props.item.settings}}</td>
          <td>
            <v-btn @click="deleteRepository(props.item.name)">
              <v-icon>mdi-delete</v-icon>
              Delete
            </v-btn>
          </td>
        </tr>
      </template>
      <template v-slot:expanded-item="{item}">
        <tr class="v-data-table__expand-row">
          <td :colspan="HEADERS.length" class="py-3 px-3">
            <repository :repository="item.name"/>
          </td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script>
  import BtnGroup from '@/components/shared/BtnGroup'
  import DataLoader from '@/components/shared/DataLoader'
  import ListTileLink from '@/components/shared/ListTile/ListTileLink'
  import NewRepository from '@/components/Snapshots/NewRepository'
  import Repository from '@/components/Snapshots/Repository'
  import SettingsDropdown from '@/components/shared/TableSettings/SettingsDropdown'
  import SingleSetting from '@/components/shared/TableSettings/SingleSetting'
  import { fuzzyTableFilter } from '@/helpers/filters'
  import { fixedTableHeaderOnDisable, fixedTableHeaderOnEnable, resetTableHeight } from '@/mixins/FixedTableHeader'
  import { DEFAULT_ITEMS_PER_PAGE } from '@/consts'
  import { mapVuexAccessors } from '@/helpers/store'
  import { elasticsearchRequest } from '@/mixins/ElasticsearchAdapterHelper'

  export default {
    name: 'snapshot-repositories-table',
    components: {
      BtnGroup,
      DataLoader,
      ListTileLink,
      NewRepository,
      Repository,
      SettingsDropdown,
      SingleSetting
    },
    props: {
      repositories: {
        default: () => {
          return {}
        },
        type: Object
      },
      loading: {
        default: false,
        type: Boolean
      }
    },
    computed: {
      items () {
        return Object.keys(this.repositories).map(k => Object.assign({}, { name: k }, this.repositories[k]))
      },
      stickyTableHeader: {
        get () {
          return this.$store.state.snapshotRepositories.stickyTableHeader
        },
        set (value) {
          if (!value) resetTableHeight()
          this.$store.commit('snapshotRepositories/setStickyTableHeader', value)
        }
      },
      tableClasses () {
        return [
          'table--condensed',
          { 'table--fixed-header': this.stickyTableHeader }
        ]
      },
      ...mapVuexAccessors('snapshotRepositories', ['filter', 'pagination'])
    },
    watch: {
      repositories () {
        // close all expanded rows on reloading repositories
        // let expanded = this.$refs.repositoriesDataTable.expanded
        // Object.keys(expanded).forEach(k => {
        //   expanded[k] = false
        // })
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
        { text: '', value: 'expand-icon', sortable: false, width: '48px' },
        { text: 'name', value: 'name' },
        { text: 'type', value: 'type' },
        { text: 'settings', value: 'settings', sortable: false },
        { text: '', value: 'actions', sortable: false }
      ]
      this.DEFAULT_ITEMS_PER_PAGE = DEFAULT_ITEMS_PER_PAGE
    },
    methods: {
      callFuzzyTableFilter (items, search, filter, headers) {
        return fuzzyTableFilter(items, search, headers)
      },
      emitReloadData () {
        this.$emit('reloadData')
      },
      expandRepository (props) {
        props.expand.props.value = !props.expand.props.value
        props.expand.on.input(props.expand.props.value)
      },
      deleteRepository (name) {
        elasticsearchRequest({
          method: 'snapshotDeleteRepository',
          methodParams: { repository: name },
          callback: this.emitReloadData,
          growl: `The repository '${name}' was successfully deleted.`,
          confirmMessage: `Delete repository '${name}' and snapshots inside?`
        })
      }
    }
  }
</script>
