<template>
  <div>
    <v-container>
      <v-row>
        <v-col>
          <new-instance/>
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
            @click="switchCluster(index)">
          <td class="pt-1">
            <div :title="$t('elasticsearch_instance.instances_table.row.cluster_health.title', {status: item.status})"
                 class="d-inline-block">
              <svg class="mr-1" height="14" style="margin-bottom: 6px" width="14">
                <circle :class="`health--${item.status}`" cx="7" cy="9" r="5"/>
              </svg>
            </div>

            <div class="d-inline-block text-truncate" style="max-width: 300px;">
              {{ item.name }}
              <v-chip v-if="index === activeInstanceIdx" class="mx-1" color="success" small>active</v-chip>
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
            <rename-instance :cluster-idx="index" :cluster-name="item.name" :cluster-uri="item.uri"/>

            <v-btn :id="`remove-instance-${index}`" class="ml-1" icon
                   small
                   :title="$t('elasticsearch_instance.instances_table.row.remove_cluster.title')"
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
  import { DEFAULT_ITEMS_PER_PAGE } from '@/consts'
  import { ref } from '@vue/composition-api'
  import i18n from '@/i18n'
  import RenameInstance from '@/components/ElasticsearchInstance/RenameInstance'
  import NewInstance from '@/components/ElasticsearchInstance/NewInstance'
  import CopyButton from '@/components/shared/CopyButton'
  import { reloadHomePage } from '@/helpers'

  export default {
    name: 'instances-table',
    components: {
      CopyButton,
      NewInstance,
      RenameInstance
    },
    setup (props, context) {
      const { activeInstanceIdx, instances } = vuexAccessors('connection', ['activeInstanceIdx', 'instances'])

      const switchCluster = index => reloadHomePage(context.root.$router, index)

      const removeInstance = index => {
        if (confirm(i18n.t('elasticsearch_instance.instances_table.row.remove_cluster.confirm', {
          name: instances.value[index].name,
          uri: instances.value[index].uri
        }))) {
          let reload
          if (index === activeInstanceIdx.value) reload = true
          store.commit('connection/removeInstance', index)
          if (reload) reloadHomePage(context.root.$router, 0)
        }
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
        instances,
        switchCluster,
        removeInstance,
        filter,
        headers,
        DEFAULT_ITEMS_PER_PAGE
      }
    }
  }
</script>
