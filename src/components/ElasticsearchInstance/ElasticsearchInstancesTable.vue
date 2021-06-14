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
                          append-icon="mdi-magnify"
                          class="mr-2 mt-0 mb-1 v-text-field--small"
                          hide-details
                          autocomplete="off"
                          autofocus
                          label="Filter..."
                          name="filter"/>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <v-data-table id="elasticsearch-clusters"
                  dense
                  :items="instances"
                  :footer-props="{itemsPerPageOptions: DEFAULT_ITEMS_PER_PAGE, showFirstLastPage: true}"
                  :headers="headers"
                  :search="filter">
      <template v-slot:item="{ item, index }">
        <tr class="tr--clickable" :title="`Connect to cluster at '${item.uri}'`" @click="setActiveInstanceIdx(index)">
          <td class="pt-1">
            <div class="d-inline-block" :title="`Cluster health: ${item.status}`">
              <svg style="margin-bottom: 6px" class="mr-1" height="14" width="14">
                <circle :class="`health--${item.status}`" cx="7" cy="9" r="5"/>
              </svg>
            </div>

            <div class="d-inline-block text-truncate" style="max-width: 200px;">
              {{ item.name }}
              <v-chip v-if="index === activeInstanceIdx" small color="success" class="mx-1">active</v-chip>
            </div>
          </td>
          <td>
            <div class="d-inline-block text-truncate" style="max-width: 200px;">
              {{ item.uri }}
            </div>
          </td>
          <td>
            <rename-elasticsearch-instance :cluster-idx="index" :cluster-name="item.name" :cluster-uri="item.uri"/>

            <v-btn icon small :id="`remove-instance-${index}`"
                   class="ml-1"
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
  import RenameElasticsearchInstance from '@/components/ElasticsearchInstance/RenameElasticsearchInstance'
  import NewElasticsearchInstance from '@/components/ElasticsearchInstance/NewElasticsearchInstance'

  export default {
    name: 'elasticsearch-instances-table',
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
        if (confirm(`Remove cluster '${instances.value[index].name}' (${instances.value[index].uri})?`)) {
          let reload
          if (index === activeInstanceIdx.value) reload = true
          store.commit('connection/removeInstance', index)
          if (reload) window.location.replace(BASE_URI)
        }
      }

      const filter = ref('')
      const headers = [
        { text: 'Cluster', value: 'name' },
        { text: 'Uri', value: 'uri', sortable: false },
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
