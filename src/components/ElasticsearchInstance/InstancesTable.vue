<template>
  <div>
    <v-container>
      <v-row>
        <v-col>
          <new-elasticsearch-instance/>
        </v-col>
        <v-col>
          <div class="float-right d-inline-block">
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
                  :items="instances"
                  :search="filter"
                  dense>
      <template v-slot:item="{ item, index }">
        <tr :title="$t('elasticsearch_instance.instances_table.row.title', {uri: item.uri})" class="tr--clickable"
            @click="setActiveInstanceIdx(index)">
          <td class="pt-1">
            <div :title="$t('elasticsearch_instance.instances_table.row.cluster_health.title', {status: item.status})"
                 class="d-inline-block">
              <svg class="mr-1" height="14" style="margin-bottom: 6px" width="14">
                <circle :class="`health--${item.status}`" cx="7" cy="9" r="5"/>
              </svg>
            </div>

            <div class="d-inline-block text-truncate" style="max-width: 200px;">
              {{ item.name }}
              <v-chip v-if="index === activeInstanceIdx" class="mx-1" color="success" small>active</v-chip>
            </div>
          </td>
          <td>
            <div class="d-inline-block text-truncate" style="max-width: 200px;">
              {{ item.uri }}
            </div>
          </td>
          <td>
            <rename-elasticsearch-instance :cluster-idx="index" :cluster-name="item.name" :cluster-uri="item.uri"/>

            <v-btn :id="`remove-instance-${index}`" class="ml-1" icon
                   small
                   title="Remove cluster"
                   @click.stop="removeInstance(index)">
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
  import { ref } from '@vue/composition-api'
  import i18n from '@/i18n'
  import RenameElasticsearchInstance from '@/components/ElasticsearchInstance/RenameElasticsearchInstance'
  import NewElasticsearchInstance from '@/components/ElasticsearchInstance/NewElasticsearchInstance'

  export default {
    name: 'instances-table',
    components: {
      NewElasticsearchInstance,
      RenameElasticsearchInstance
    },
    setup () {
      const { activeInstanceIdx, instances } = vuexAccessors('connection', ['activeInstanceIdx', 'instances'])

      const setActiveInstanceIdx = index => {
        store.commit('connection/setActiveInstanceIdx', index)
        window.location.replace(BASE_URI)
      }

      const removeInstance = index => {
        if (confirm(i18n.t('elasticsearch_instance.instances_table.row.remove_cluster.confirm', {
          name: instances.value[index].name,
          uri: instances.value[index].uri
        }))) {
          let reload
          if (index === activeInstanceIdx.value) reload = true
          store.commit('connection/removeInstance', index)
          if (reload) window.location.replace(BASE_URI)
        }
      }

      const filter = ref('')
      const headers = [
        { text: i18n.t('elasticsearch_instance.instances_table.headers.cluster'), value: 'name' },
        { text: i18n.t('elasticsearch_instance.instances_table.headers.uri'), value: 'uri', sortable: false },
        { text: '', sortable: false }
      ]

      return {
        activeInstanceIdx,
        instances,
        setActiveInstanceIdx,
        removeInstance,
        filter,
        headers,
        DEFAULT_ITEMS_PER_PAGE
      }
    }
  }
</script>
