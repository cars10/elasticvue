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
                          label="Filter name..."
                          name="filter"
                          title="Filter via 'column:query'"
                          @keyup.esc="filter = ''"/>
          </div>
        </v-col>
      </v-row>
    </v-card-text>

    <v-data-table ref="repositoriesDataTable"
                  :footer-props="{itemsPerPageOptions: DEFAULT_ITEMS_PER_PAGE}"
                  :headers="HEADERS"
                  :items="items"
                  :loading="loading"
                  :options.sync="pagination"
                  class="table--condensed table--fixed-header"
                  item-key="name">
      <template v-slot:item="props">
        <tr class="tr--clickable" @click="() => showSnapshots(props.item.name)">
          <td>{{ props.item.name }}</td>
          <td>{{ props.item.type }}</td>
          <td :title="stringifyJsonBigInt(props.item.settings, null, '\t')">
            {{ stringifyJsonBigInt(props.item.settings) }}
          </td>
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
  import NewRepository from '@/components/Repositories/NewRepository'
  import { DEFAULT_ITEMS_PER_PAGE } from '@/consts'
  import { vuexAccessors } from '@/helpers/store'
  import { computed } from '@vue/composition-api'
  import store from '@/store'
  import { useElasticsearchRequest } from '@/mixins/RequestComposition'
  import { showSuccessSnackbar } from '@/mixins/ShowSnackbar'
  import { stringifyJsonBigInt } from '@/helpers/json_parse'
  import { filterItems } from '@/helpers/filters'

  export default {
    name: 'repositories-table',
    components: {
      NewRepository
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
    setup (props, context) {
      const { filter, pagination } = vuexAccessors('repositories', ['filter', 'pagination'])

      const items = computed(() => {
        const repos = Object.keys(props.repositories).map(name => Object.assign({}, { name }, props.repositories[name]))
        return filterItems(repos, filter.value, ['name'])
      })

      const HEADERS = [
        { text: 'name', value: 'name' },
        { text: 'type', value: 'type' },
        { text: 'settings', value: 'settings', sortable: false },
        { text: '', value: 'actions', sortable: false }
      ]

      const emitReloadData = () => {
        context.emit('reloadData')
      }

      const showSnapshots = repository => {
        store.commit('snapshots/setRepository', repository)
        context.root.$router.push({ name: 'Snapshots' })
      }

      const { callElasticsearch } = useElasticsearchRequest()
      const deleteRepository = name => {
        if (confirm(`Delete repository '${name}' and all snapshots inside?`)) {
          callElasticsearch('snapshotDeleteRepository', { repository: name })
            .then(() => {
              emitReloadData()
              showSuccessSnackbar({
                text: 'Success',
                additionalText: `The repository '${name}' was successfully deleted.`
              })
            })
        }
      }

      return {
        items,
        filter,
        pagination,
        emitReloadData,
        showSnapshots,
        deleteRepository,
        HEADERS,
        DEFAULT_ITEMS_PER_PAGE,
        stringifyJsonBigInt
      }
    }
  }
</script>
