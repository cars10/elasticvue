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
        <tr class="tr--clickable" @click="() => showSnapshots(props.item.name)">
          <td>{{ props.item.name }}</td>
          <td>{{ props.item.type }}</td>
          <td :title="stringifyJsonBigInt(props.item.settings, null, '\t')">
            {{ stringifyJsonBigInt(props.item.settings) }}
          </td>
          <td>
            <v-btn @click.stop="deleteRepository(props.item.name)">
              <v-icon>mdi-delete</v-icon>
              {{ $t('repositories.repositories_table.table.row.delete') }}
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
  import { computed } from '@vue/composition-api'
  import store from '@/store'
  import i18n from '@/i18n'
  import { useElasticsearchRequest } from '@/mixins/RequestComposition'
  import { stringifyJsonBigInt } from '@/helpers/json_parse'
  import { filterItems } from '@/helpers/filters'
  import { showSnackbar } from '@/mixins/ShowSnackbar'
  import { confirmMethod } from '@/services/tauri/dialogs'

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

      const showSnapshots = repository => {
        store.commit('snapshots/setRepository', repository)
        context.root.$router.push({ name: 'Snapshots' })
      }

      const { requestState, callElasticsearch } = useElasticsearchRequest()
      const deleteRepository = async name => {
        if (await confirmMethod(i18n.t('repositories.repositories_table.delete_repository.confirm', { name: name }))) {
          callElasticsearch('snapshotDeleteRepository', { repository: name })
            .then(() => {
              emitReloadData()
              showSnackbar(requestState.value, {
                body: i18n.t('repositories.repositories_table.delete_repository.growl', { name: name })
              })
            }).catch(() => showSnackbar(requestState.value))
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
