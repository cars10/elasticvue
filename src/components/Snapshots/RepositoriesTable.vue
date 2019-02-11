<template>
  <div>
    <v-card-text>
      <div class="clearfix">
        <new-repository @reloadData="emitReloadData"/>
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

    <v-data-table ref="repositoriesDataTable"
                  :rows-per-page-items="DEFAULT_ROWS_PER_PAGE"
                  :headers="HEADERS"
                  :items="items"
                  :custom-filter="callFuzzyTableFilter"
                  :pagination.sync="pagination"
                  :search="filter"
                  :loading="loading"
                  :class="tableClasses"
                  item-key="name"
                  expand>
      <template v-slot:items="props">
        <tr class="tr--clickable" @click="() => expandRepository(props)">
          <td>
            <v-icon v-if="props.expanded">keyboard_arrow_up</v-icon>
            <v-icon v-else>keyboard_arrow_down</v-icon>
          </td>
          <td>{{props.item.name}}</td>
          <td>{{props.item.type}}</td>
          <td>{{props.item.settings}}</td>
          <td>
            <btn-group small>
              <v-menu offset-y left @click.native.stop>
                <v-btn slot="activator" title="Options">
                  <v-icon>settings</v-icon>
                  <v-icon small>arrow_drop_down</v-icon>
                </v-btn>
                <v-list>
                  <list-tile-link :method-params="{repository: props.item.name}" :callback="emitReloadData"
                                  :growl="`The repository '${props.item.name}' was successfully deleted.`"
                                  :confirm-message="`Delete repository '${props.item.name}' and snapshots inside?`"
                                  method="snapshotDeleteRepository" icon="delete" link-title="Delete repository"/>
                </v-list>
              </v-menu>
            </btn-group>
          </td>
        </tr>
      </template>
      <template slot="expand" slot-scope="props">
        <v-card flat class="pl-5">
          <v-card-text>
            <repository :repository="props.item.name"/>
          </v-card-text>
        </v-card>
      </template>
    </v-data-table>
  </div>
</template>

<script>
  import { fuzzyTableFilter } from '@/helpers/filters'
  import { fixedTableHeaderOnDisable, fixedTableHeaderOnEnable, resetTableHeight } from '@/mixins/FixedTableHeader'
  import { DEFAULT_ROWS_PER_PAGE } from '@/consts'
  import { mapVuexAccessors } from '@/helpers/store'
  import SingleSetting from '@/components/shared/SingleSetting'
  import SettingsDropdown from '@/components/shared/SettingsDropdown'
  import NewRepository from '@/components/Snapshots/NewRepository'
  import Repository from '@/components/Snapshots/Repository'
  import ListTileLink from '@/components/shared/ListTile/ListTileLink'
  import BtnGroup from '@/components/shared/BtnGroup'

  export default {
    name: 'SnapshotRepositoriesTable',
    components: {
      SettingsDropdown,
      SingleSetting,
      NewRepository,
      Repository,
      ListTileLink,
      BtnGroup
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
        let expanded = this.$refs.repositoriesDataTable.expanded
        Object.keys(expanded).forEach(k => {
          expanded[k] = false
        })
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
      this.DEFAULT_ROWS_PER_PAGE = DEFAULT_ROWS_PER_PAGE
    },
    methods: {
      callFuzzyTableFilter (items, search, filter, headers) {
        return fuzzyTableFilter(items, search, headers)
      },
      emitReloadData () {
        this.$emit('reloadData')
      },
      expandRepository (props) {
        props.expanded = !props.expanded
      }
    }
  }
</script>
