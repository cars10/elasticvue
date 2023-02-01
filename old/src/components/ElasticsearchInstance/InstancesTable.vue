<template>
  <div>
    <v-container>
      <v-row>
        <v-col>
          <new-instance/>
        </v-col>
        <v-col>
          <div class="float-right">
            <v-text-field v-model="filter"
                          :label="$t('defaults.filter.label')"
                          append-icon="mdi-magnify"
                          autocomplete="off"
                          autofocus
                          class="mr-2 mt-0 mb-1 v-text-field--small"
                          hide-details
                          name="filter"/>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <v-data-table id="elasticsearch-clusters"
                  :footer-props="{itemsPerPageOptions: DEFAULT_ITEMS_PER_PAGE, showFirstLastPage: true}"
                  :headers="headers"
                  :items="indexedInstances"
                  :search="filter"
                  dense>
      <template v-slot:item="{ item }">
        <tr :title="$t('elasticsearch_instance.instances_table.row.title', {uri: item.uri})" class="tr--clickable"
            @click="switchCluster(item.index)">
          <td class="pt-1">
            <div :title="$t('elasticsearch_instance.instances_table.row.cluster_health.title', {status: item.status})"
                 class="d-inline-block">
              <svg class="mr-1" height="14" style="margin-bottom: 6px" width="14">
                <circle :class="`health--${item.status}`" cx="7" cy="9" r="5"/>
              </svg>
            </div>

            <div class="d-inline-block text-truncate" style="max-width: 300px;">
              {{ item.name }}
              <v-chip v-if="item.index === activeInstanceIdx" class="mx-1" color="success" small>active</v-chip>
            </div>
          </td>
          <td class="pt-1">
            <div class="d-inline-block text-truncate" style="max-width: 250px;">
              {{ item.uri }}

              <copy-button small :value="item.uri" :title="$t('elasticsearch_instance.instances_table.row.copy_uri')"/>
            </div>
          </td>
          <td>
            {{ item.version }}
          </td>
          <td>
            <rename-instance :cluster-idx="item.index" :cluster-name="item.name" :cluster-uri="item.uri"/>

            <v-btn :id="`remove-instance-${item.index}`" class="ml-1" icon
                   small
                   :title="$t('elasticsearch_instance.instances_table.row.remove_cluster.title')"
                   @click.stop="removeInstance(item.index)">
              <v-icon small>mdi-delete</v-icon>
            </v-btn>
          </td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script>
  import store from '@/store'
  import { vuexAccessors } from '@/helpers/store'
  import { BASE_URI, DEFAULT_ITEMS_PER_PAGE } from '@/consts'
  import { computed, ref } from 'vue'
  import i18n from '@/i18n'
  import RenameInstance from '@/components/ElasticsearchInstance/RenameInstance'
  import NewInstance from '@/components/ElasticsearchInstance/NewInstance'
  import CopyButton from '@/components/shared/CopyButton'
  import { reloadHomePage } from '@/helpers'
  import { askConfirm } from '@/services/tauri/dialogs'
  import { useRouter } from '@/helpers/composition'

  export default {
    name: 'instances-table',
    components: {
      CopyButton,
      NewInstance,
      RenameInstance
    },
    setup () {
      const { activeInstanceIdx, instances } = vuexAccessors('connection', ['activeInstanceIdx', 'instances'])

      const indexedInstances = computed(() => {
        return [...instances.value].map((instance, i) => Object.assign({}, instance, { index: i }))
      })

      const { router } = useRouter()
      const switchCluster = index => reloadHomePage(router, index.toString())

      const removeInstance = index => {
        askConfirm(i18n.t('elasticsearch_instance.instances_table.row.remove_cluster.confirm', {
          name: instances.value[index].name, uri: instances.value[index].uri
        })).then(confirmed => {
          if (confirmed) {
            let reset
            if (index === activeInstanceIdx.value) reset = true
            store.commit('connection/removeInstance', index)
            if (reset) window.location.replace(BASE_URI)
          }
        })
      }

      const filter = ref('')
      const headers = [
        { text: i18n.t('elasticsearch_instance.instances_table.headers.cluster'), value: 'name' },
        { text: i18n.t('elasticsearch_instance.instances_table.headers.uri'), value: 'uri', sortable: false },
        { text: i18n.t('elasticsearch_instance.instances_table.headers.version'), value: 'version', sortable: false },
        { text: '', sortable: false }
      ]

      return {
        activeInstanceIdx,
        indexedInstances,
        switchCluster,
        removeInstance,
        filter,
        headers,
        DEFAULT_ITEMS_PER_PAGE
      }
    }
  }
</script>
