<template>
  <v-dialog v-model="dialog" width="700">
    <template v-slot:activator="{on}">
      <v-list-item v-on="on">
        <v-list-item-action>
          <v-icon small>mdi-at</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Aliases</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>

    <v-card>
      <v-card-title>
        <h2 class="text-h5">Manage aliases</h2>
        <div class="ml-a">
          <v-btn icon title="Close" @click.native="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>
      <v-divider/>

      <v-card-text>
        <p class="my-2 text-body-1">Index: {{ indexName }}</p>
        <v-form @submit.prevent="addAlias">
          <v-row>
            <v-col class="flex-grow-1">
              <v-text-field id="new_index_alias_name"
                            v-model="newAlias"
                            autocomplete="off"
                            hide-details
                            label="Add alias"/>
            </v-col>
            <v-col class="flex-grow-0">
              <v-btn id="add_index_alias"
                     :disabled="requestState.loading || newAlias.length === 0"
                     class="mt-3"
                     type="submit">
                Add new alias
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-data-table :footer-props="{itemsPerPageOptions: DEFAULT_ITEMS_PER_PAGE}"
                    :headers="HEADERS"
                    :items="items || []"
                    :loading="requestState.loading"
                    class="table--condensed table--fixed-header">
        <template v-slot:item="props">
          <tr>
            <td>{{ props.item.item }}</td>
            <td class="text-right">
              <v-btn @click="deleteAlias(props.item.item)">Delete</v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </v-dialog>
</template>

<script>
  import { DEFAULT_ITEMS_PER_PAGE } from '@/consts'
  import { useElasticsearchRequest } from '@/mixins/RequestComposition'
  import { computed, ref, watch } from '@vue/composition-api'
  import { showErrorSnackbar } from '@/mixins/ShowSnackbar'

  export default {
    name: 'index-aliases',
    props: {
      indexName: {
        default: '',
        type: String
      }
    },
    setup (props, context) {
      const dialog = ref(false)
      const newAlias = ref('')

      const data = ref(null)
      const { requestState, callElasticsearch } = useElasticsearchRequest()
      const loadAliases = () => {
        callElasticsearch('indexGetAlias', { index: props.indexName })
          .then(body => (data.value = body))
          .catch(() => (data.value = null))
      }

      watch(dialog, value => {
        if (value) {
          loadAliases()
        } else {
          context.emit('reload')
        }
      })

      const items = computed(() => {
        if (data.value) {
          return Object.keys(data.value[props.indexName].aliases).map(alias => ({ item: alias }))
        } else {
          return []
        }
      })

      const HEADERS = [
        { text: 'Name', value: 'item' },
        { text: '', sortable: false }
      ]

      const addAlias = () => {
        callElasticsearch('indexAddAlias', { index: props.indexName, alias: newAlias.value })
          .then(() => {
            loadAliases()
            newAlias.value = ''
          })
          .catch(() => {
            showErrorSnackbar({
              text: `Error creating alias '${newAlias.value}': ${requestState.value.status}`,
              additionalText: requestState.value.apiErrorMessage
            })
          })
      }

      const deleteAlias = alias => {
        if (!confirm(`Delete alias '${alias}' for index '${props.indexName}'?`)) return

        callElasticsearch('indexDeleteAlias', { index: props.indexName, alias })
          .then(loadAliases)
          .catch(() => {
            showErrorSnackbar({
              text: `Error removing alias '${alias}': ${requestState.value.status}`,
              additionalText: requestState.value.apiErrorMessage
            })
          })
      }

      return {
        newAlias,
        HEADERS,
        DEFAULT_ITEMS_PER_PAGE,
        requestState,
        items,
        dialog,
        addAlias,
        deleteAlias
      }
    }
  }
</script>
