<template>
  <div>
    <div class="my-2 pa-4 lowered">
      <v-row>
        <v-col>
          <v-row class="my-1">
            <v-col>
              <div class="d-inline-block float-right">
                <v-btn icon @click="onlyFavorites = !onlyFavorites" class="mr-2">
                  <v-icon v-if="onlyFavorites" title="Show all">mdi-star</v-icon>
                  <v-icon v-else title="Show only favorites">mdi-star-outline</v-icon>
                </v-btn>

                <v-text-field id="filter"
                              v-model="filter"
                              append-icon="mdi-magnify"
                              autofocus
                              class="mt-0 pt-0 v-text-field--small"
                              hide-details
                              label="Filter..."
                              name="filter"
                              @keyup.esc="filter = ''"/>
              </div>
            </v-col>
          </v-row>

          <v-data-table :items="items"
                        dense
                        :headers="HEADERS"
                        :loading="loading"
                        :footer-props="{itemsPerPageOptions: DEFAULT_ITEMS_PER_PAGE, showFirstLastPage: true}">
            <template v-slot:item="{ item }">
              <tr class="tr--clickable"
                  :class="{'active': selectedItem && item.id === selectedItem.id}"
                  @click.exact="selectItem(item)"
                  @click.ctrl="apply(item)"
                  title="Click to preview request body, ctrl+click to directly use.">
                <td>
                  <v-btn icon @click.stop="favoriteItem(item)">
                    <v-icon v-if="item.favorite === 1" title="Remove favorite">mdi-star</v-icon>
                    <v-icon v-else title="Favorite">mdi-star-outline</v-icon>
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
                    Clear
                    <v-icon>mdi-menu-down</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="clearNonFavorites">
                    <v-list-item-title>Delete only non-favorites</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="clearAll">
                    <v-list-item-title>Delete all</v-list-item-title>
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
              <v-btn class="mt-4" color="primary-button" @click="apply(selectedItem)">Use</v-btn>
              <v-btn icon @click="removeHistoryItem(selectedItem.id)" class="mt-4 ml-2" title="Remove entry">
                <v-icon>mdi-delete</v-icon>
              </v-btn>

              <button class="btn-link float-right mt-4" @click="selectItem(null)">
                <small>unselect</small>
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
  import { ref } from '@vue/composition-api'
  import { useHistory } from '@/mixins/History'
  import { DEFAULT_ITEMS_PER_PAGE, IDB_TABLE_NAMES } from '@/consts'
  import CodeViewer from '@/components/shared/CodeViewer'

  export default {
    name: 'rest-query-history',
    components: {
      CodeViewer
    },
    setup (props, context) {
      const HEADERS = [
        { text: 'Query', sortable: false },
        { text: 'Date', value: 'date' }
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
