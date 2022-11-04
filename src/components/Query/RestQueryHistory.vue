<template>
  <div>
    <div class="my-2 pa-4 lowered">
      <v-row>
        <v-col>
          <v-row class="my-1">
            <v-col>
              <div class="d-inline-block float-right">
                <v-btn class="mr-2" icon @click="onlyFavorites = !onlyFavorites">
                  <v-icon v-if="onlyFavorites" :title="$t('query.rest_query_history.favorites_filter.show_all')">
                    mdi-star
                  </v-icon>
                  <v-icon v-else :title="$t('query.rest_query_history.favorites_filter.only_favorites')">
                    mdi-star-outline
                  </v-icon>
                </v-btn>

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

          <v-data-table :footer-props="{itemsPerPageOptions: DEFAULT_ITEMS_PER_PAGE, showFirstLastPage: true}"
                        :headers="HEADERS"
                        :items="items"
                        :loading="loading"
                        dense>
            <template v-slot:item="{ item }">
              <tr :class="{'active': selectedItem && item.id === selectedItem.id}"
                  :title="$t('query.rest_query_history.table.row.title')"
                  class="tr--clickable"
                  @click.exact="selectItem(item)"
                  @click.ctrl="apply(item)">
                <td>
                  <v-btn icon @click.stop="favoriteItem(item)">
                    <v-icon v-if="item.favorite === 1"
                            :title="$t('query.rest_query_history.table.row.favorite.remove')">
                      mdi-star
                    </v-icon>
                    <v-icon v-else :title="$t('query.rest_query_history.table.row.favorite.add')">
                      mdi-star-outline
                    </v-icon>
                  </v-btn>
                  <span class="font--mono">{{ item.method }}</span> {{ item.path }}
                </td>
                <td>{{ item.date.toLocaleString() }}</td>
              </tr>
            </template>

            <template v-slot:footer.prepend>
              <v-menu v-if="items.length > 0" offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn v-bind="attrs" v-on="on" text>
                    {{ $t('query.rest_query_history.clear.text') }}
                    <v-icon>mdi-menu-down</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="clearNonFavorites">
                    <v-list-item-title>{{ $t('query.rest_query_history.clear.only_non_favorites') }}</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="clearAll">
                    <v-list-item-title>{{ $t('query.rest_query_history.clear.all') }}</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
          </v-data-table>
        </v-col>

        <v-col class="d-flex" style="flex-flow: column">
          <template v-if="selectedItem">
            <span class="text-subtitle-1 mb-1">
              <span class="font--mono">{{ selectedItem.method }}</span>
              {{ selectedItem.path }}
            </span>
            <code-viewer v-model="selectedItem.body" :focus="false" style="flex:2"/>
            <div>
              <v-btn class="mt-4" color="primary-button" @click="apply(selectedItem)">
                {{ $t('query.rest_query_history.body_preview.use') }}
              </v-btn>
              <v-btn :title="$t('query.rest_query_history.body_preview.remove_entry')" class="mt-4 ml-2" icon
                     @click="removeHistoryItem(selectedItem.id)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>

              <button class="btn-link float-right mt-4" @click="selectItem(null)">
                <small>{{ $t('query.rest_query_history.body_preview.unselect') }}</small>
              </button>
            </div>
          </template>
        </v-col>
      </v-row>
    </div>

    <v-divider class="mt-8 mb-4"/>
  </div>
</template>

<script>
  import { ref } from 'vue'
  import { useHistory } from '@/mixins/History'
  import { DEFAULT_ITEMS_PER_PAGE, IDB_TABLE_NAMES } from '@/consts'
  import CodeViewer from '@/components/shared/CodeViewer'
  import i18n from '@/i18n'

  export default {
    name: 'rest-query-history',
    components: {
      CodeViewer
    },
    setup (props, context) {
      const HEADERS = [
        { text: i18n.t('query.rest_query_history.table.headers.query'), sortable: false },
        { text: i18n.t('query.rest_query_history.table.headers.date'), value: 'date' }
      ]

      const {
        loading,
        favoriteItem,
        removeItem,
        clearAll,
        items,
        filter,
        onlyFavorites,
        clearNonFavorites
      } = useHistory(IDB_TABLE_NAMES.REST)
      const apply = item => context.emit('setRequest', item)

      const selectedItem = ref(null)
      const selectItem = item => (selectedItem.value = item)

      const removeHistoryItem = id => {
        removeItem(id)
        selectItem(null)
      }

      return {
        loading,
        HEADERS,
        filter,
        items,
        onlyFavorites,
        selectedItem,
        selectItem,
        favoriteItem,
        removeHistoryItem,
        apply,
        clearAll,
        clearNonFavorites,
        DEFAULT_ITEMS_PER_PAGE
      }
    }
  }
</script>
