<template>
  <v-dialog v-model="dialog" width="700">
    <template v-slot:activator="{on}">
      <v-list-item v-on="on">
        <v-list-item-action>
          <v-icon small>mdi-at</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ $t('indices.index_aliases.text') }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>

    <v-card>
      <v-card-title>
        <h2 class="text-h5">{{ $t('indices.index_aliases.heading') }}</h2>
        <div class="ml-a">
          <v-btn icon :title="$t('defaults.close')" @click.native="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>
      <v-divider/>

      <v-card-text>
        <p class="my-2 text-body-1">{{ $t('indices.index_aliases.index', { indexName }) }}</p>
        <v-form @submit.prevent="addAlias">
          <v-row>
            <v-col class="flex-grow-1">
              <v-text-field id="new_index_alias_name"
                            v-model="newAlias"
                            autocomplete="off"
                            hide-details
                            :label="$t('indices.index_aliases.form.new_alias.label')"/>
            </v-col>
            <v-col class="flex-grow-0">
              <v-btn id="add_index_alias"
                     :disabled="requestState.loading || newAlias.length === 0"
                     class="mt-3"
                     type="submit">
                {{ $t('indices.index_aliases.form.add_alias') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-data-table :footer-props="{itemsPerPageOptions: DEFAULT_ITEMS_PER_PAGE, showFirstLastPage: true}"
                    :headers="HEADERS"
                    :items="items || []"
                    :loading="requestState.loading"
                    class="table--condensed table--fixed-header">
        <template v-slot:item="props">
          <tr>
            <td>{{ props.item.item }}</td>
            <td class="text-right">
              <v-btn @click="deleteAlias(props.item.item)">{{ $t('defaults.delete') }}</v-btn>
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
  import { computed, ref, watch } from 'vue'
  import { showSnackbar } from '@/mixins/ShowSnackbar'
  import i18n from '@/i18n'
  import { askConfirm } from '@/services/tauri/dialogs'

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
        { text: i18n.t('indices.index_aliases.table.headers.alias'), value: 'item' },
        { text: '', sortable: false }
      ]

      const addAlias = () => {
        callElasticsearch('indexAddAlias', { index: props.indexName, alias: newAlias.value })
          .then(() => {
            loadAliases()
            newAlias.value = ''
          })
          .catch(() => showSnackbar(requestState.value))
      }

      const deleteAlias = alias => {
        askConfirm(i18n.t('indices.index_aliases.delete_alias.confirm', {
          alias, index: props.indexName
        })).then(confirmed => {
          if (confirmed) {
            callElasticsearch('indexDeleteAlias', { index: props.indexName, alias })
              .then(loadAliases)
              .catch(() => showSnackbar(requestState.value))
          }
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
