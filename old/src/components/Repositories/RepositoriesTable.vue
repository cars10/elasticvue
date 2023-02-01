<template>
  <div>
    <v-card-text>
      <v-row>
        <v-col>
          <new-repository @reloadData="emitReloadData"/>
        </v-col>
        <v-col>
          <div class="float-right">
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

    <v-data-table ref="repositoriesDataTable"
                  :footer-props="{itemsPerPageOptions: DEFAULT_ITEMS_PER_PAGE, showFirstLastPage: true}"
                  :headers="HEADERS"
                  :items="items"
                  :loading="loading"
                  :options.sync="pagination"
                  class="table--condensed table--fixed-header"
                  item-key="name">
      <template v-slot:item="props">
        <tr>
          <td>{{ props.item.name }}</td>
          <td>{{ props.item.type }}</td>
          <td :title="stringifyJsonBigInt(props.item.settings, null, '\t')">
            {{ stringifyJsonBigInt(props.item.settings) }}
          </td>
          <td>
            <v-btn :to="{name: 'Snapshots', params: {repositoryName: props.item.name}}" class="mr-2">
              <v-icon>mdi-backup-restore</v-icon>
              Manage Snapshots
            </v-btn>
            <v-btn @click.stop="deleteRepository(props.item.name)"
                   :title="$t('repositories.repositories_table.table.row.delete')">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </td>
        </tr>
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
  import NewRepository from '@/components/Repositories/NewRepository'
  import { DEFAULT_ITEMS_PER_PAGE } from '@/consts'
  import { vuexAccessors } from '@/helpers/store'
  import { computed } from 'vue'
  import store from '@/store'
  import i18n from '@/i18n'
  import { useElasticsearchRequest } from '@/mixins/RequestComposition'
  import { stringifyJsonBigInt } from '@/helpers/json_parse'
  import { filterItems } from '@/helpers/filters'
  import { showSnackbar } from '@/mixins/ShowSnackbar'
  import { askConfirm } from '@/services/tauri/dialogs'
  import { useRouter } from '@/helpers/composition'

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
        { text: i18n.t('repositories.repositories_table.table.headers.name'), value: 'name' },
        { text: i18n.t('repositories.repositories_table.table.headers.type'), value: 'type' },
        { text: i18n.t('repositories.repositories_table.table.headers.settings'), value: 'settings', sortable: false },
        { text: '', value: 'actions', sortable: false }
      ]

      const emitReloadData = () => (context.emit('reloadData'))

      const { router } = useRouter()
      const showSnapshots = repository => {
        store.commit('snapshots/setRepository', repository)
        router.push({ name: 'Snapshots' })
      }

      const { requestState, callElasticsearch } = useElasticsearchRequest()
      const deleteRepository = name => {
        askConfirm(i18n.t('repositories.repositories_table.delete_repository.confirm', { name }))
          .then(confirmed => {
            if (confirmed) {
              callElasticsearch('snapshotDeleteRepository', { repository: name })
                .then(() => {
                  emitReloadData()
                  showSnackbar(requestState.value, {
                    body: i18n.t('repositories.repositories_table.delete_repository.growl', { name: name })
                  })
                }).catch(() => showSnackbar(requestState.value))
            }
          })
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
