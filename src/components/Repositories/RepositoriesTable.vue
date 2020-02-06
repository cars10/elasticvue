<template>
  <div>
    <v-card-text>
      <v-row>
        <v-col>
          <new-repository @reloadData="emitReloadData"/>
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

            <settings-dropdown>
              <single-setting v-model="stickyTableHeader" class="mb-1" name="Sticky table header"/>
            </settings-dropdown>
          </div>
        </v-col>
      </v-row>
    </v-card-text>

    <v-data-table ref="repositoriesDataTable"
                  :class="tableClasses"
                  :footer-props="{itemsPerPageOptions: DEFAULT_ITEMS_PER_PAGE}"
                  :headers="HEADERS"
                  :items="filteredItems"
                  :loading="loading"
                  :options.sync="pagination"
                  item-key="name">
      <template v-slot:item="props">
        <tr class="tr--clickable" @click="() => showSnapshots(props.item.name)">
          <td>{{props.item.name}}</td>
          <td>{{props.item.type}}</td>
          <td :title="JSON.stringify(props.item.settings, null, '\t')">{{props.item.settings}}</td>
          <td>
            <v-btn @click.stop="deleteRepository(props.item.name)">
              <v-icon>mdi-delete</v-icon>
              Delete
            </v-btn>
          </td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script>
  import DataLoader from '@/components/shared/DataLoader'
  import NewRepository from '@/components/Repositories/NewRepository'
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
      DataLoader,
      NewRepository,
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
          return this.$store.state.repositories.stickyTableHeader
        },
        set (value) {
          if (!value) resetTableHeight()
          this.$store.commit('repositories/setStickyTableHeader', value)
        }
      },
      tableClasses () {
        return [
          'table--condensed',
          { 'table--fixed-header': this.stickyTableHeader }
        ]
      },
      filteredItems () {
        return fuzzyTableFilter(this.items, this.filter, this.HEADERS)
      },
      ...mapVuexAccessors('repositories', ['filter', 'pagination'])
    },
    mounted () {
      fixedTableHeaderOnEnable()
    },
    beforeDestroy () {
      fixedTableHeaderOnDisable()
    },
    created () {
      this.HEADERS = [
        { text: 'name', value: 'name' },
        { text: 'type', value: 'type' },
        { text: 'settings', value: 'settings', sortable: false },
        { text: '', value: 'actions', sortable: false }
      ]
      this.DEFAULT_ITEMS_PER_PAGE = DEFAULT_ITEMS_PER_PAGE
    },
    methods: {
      emitReloadData () {
        this.$emit('reloadData')
      },
      showSnapshots (repository) {
        this.$store.commit('snapshots/setRepository', repository)
        this.$router.push({ name: 'Snapshots' })
      },
      deleteRepository (name) {
        elasticsearchRequest({
          method: 'snapshotDeleteRepository',
          methodParams: { repository: name },
          callback: this.emitReloadData,
          growl: `The repository '${name}' was successfully deleted.`,
          confirmMessage: `Delete repository '${name}' and all snapshots inside?`
        })
      }
    }
  }
</script>
