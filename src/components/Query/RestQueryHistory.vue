<template>
  <div>
    <v-badge content="Beta" title="This is a beta feature and might not work as expected." color="primary-button">
      <v-btn class="pl-1" @click="historyCollapsed = !historyCollapsed" title="Show history">
        <v-icon>{{ historyCollapsed ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        History
      </v-btn>
    </v-badge>

    <v-expand-transition>
      <div v-if="historyCollapsed" class="my-2 pa-2 lowered">
        <v-row>
          <v-col>
            <v-row class="mt-1 mb-2">
              <v-col>
                <div class="d-inline-block float-right">
                  <v-checkbox v-model="onlyFavorites"
                              label="Only favorites"
                              class="d-inline-block mr-6 vertical-align--bottom"
                              hide-details/>
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
                </div>
              </v-col>
            </v-row>

            <v-data-table :items="items" dense :headers="HEADERS" :loading="loading"
                          :footer-props="{itemsPerPageOptions: DEFAULT_ITEMS_PER_PAGE, showFirstLastPage: true}">
              <template v-slot:item="{ item }">
                <tr class="tr--clickable" :class="selectedItem && item.id === selectedItem.id ? 'active' : ''"
                    @click="setSelectedItem(item)" title="Click to preview request body">
                  <td>
                    <v-icon>mdi-magnify</v-icon>
                    {{ item.method }} {{ item.url }}
                  </td>
                  <td>{{ item.date ? item.date.toLocaleString() : '' }}</td>
                  <td>
                    <v-btn icon title="Use" @click="apply(item)">
                      <v-icon>mdi-check</v-icon>
                    </v-btn>
                    <v-btn icon @click.stop="favoriteItem(item)">
                      <v-icon v-if="item.favorite === 1" title="Remove favorite">mdi-star</v-icon>
                      <v-icon v-else title="Favorite">mdi-star-outline</v-icon>
                    </v-btn>
                    <v-btn icon title="Delete" @click.stop="removeItem(item.id)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </template>
              <template v-slot:footer.prepend>
                <v-menu v-if="items && items.length > 0" offset-y>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn v-bind="attrs" v-on="on">
                      Clear
                      <v-icon>mdi-menu-down</v-icon>
                    </v-btn>
                  </template>
                  <v-list>
                    <v-list-item @click="clearNonFavorites">
                      <v-list-item-title>Delete only non-favorites</v-list-item-title>
                    </v-list-item>
                    <v-list-item @click="clear">
                      <v-list-item-title>Delete everything</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>
            </v-data-table>
          </v-col>
          <v-col class="d-flex" style="flex-flow:column">
            <template v-if="selectedItem">
              <span class="text-subtitle-1">{{ selectedItem.method }} {{ selectedItem.url }}</span>
              <div style="flex: 2">
                <code-viewer v-model="selectedItem.body"/>
              </div>
              <div>
                <v-btn class="mt-4" color="primary-button" @click="apply(selectedItem)">Apply</v-btn>
              </div>
            </template>
          </v-col>
        </v-row>
      </div>
    </v-expand-transition>
  </div>
</template>

<script>
  import { ref } from '@vue/composition-api'
  import CodeViewer from '@/components/shared/CodeViewer'
  import { useHistory } from '@/mixins/History'
  import { DEFAULT_ITEMS_PER_PAGE } from '@/consts'

  export default {
    name: 'rest-query-history',
    components: {
      CodeViewer
    },
    props: {
      tableName: {
        type: String
      }
    },
    setup (props, context) {
      const HEADERS = [
        { text: 'Query', sortable: false },
        { text: 'Date', value: 'date' },
        { text: 'Use', sortable: false },
        { text: '', sortable: false }
      ]
      const historyCollapsed = ref(false)

      const {
        selectedItem,
        loading,
        setSelectedItem,
        favoriteItem,
        removeItem,
        clear,
        deleteAll,
        items,
        filter,
        onlyFavorites,
        clearNonFavorites
      } = useHistory(props.tableName)
      const apply = item => context.emit('setRequest', item)

      return {
        historyCollapsed,
        loading,
        items,
        selectedItem,
        setSelectedItem,
        favoriteItem,
        removeItem,
        clear,
        deleteAll,
        HEADERS,
        apply,
        filter,
        onlyFavorites,
        clearNonFavorites,
        DEFAULT_ITEMS_PER_PAGE
      }
    }
  }
</script>
