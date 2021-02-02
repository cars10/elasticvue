<template>
  <div>
    <v-menu v-model="menuOpen" offset-y>
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-if="activeInstance" id="instance_selection_toggle" v-bind="attrs"
               :title="`Connected to '${activeInstance.name}' (${activeInstance.uri})`"
               aria-label="Instance selection" class="text-none" v-on="on">
          <svg :title="`Cluster health: ${activeInstance.status}`" class="mr-2" height="14" width="14">
            <circle :class="`health--${activeInstance.status}`" cx="7" cy="9" r="5"/>
          </svg>
          <span class="text-truncate" style="max-width: 200px">{{ activeInstance.name }}</span>
          <v-icon v-if="menuOpen">mdi-menu-up</v-icon>
          <v-icon v-else>mdi-menu-down</v-icon>
        </v-btn>
      </template>

      <v-list id="instance_selection">
        <new-elasticsearch-instance :modal-open="modalOpen"/>
        <v-divider class="mt-2"/>

        <v-list-item v-for="(item, index) in instances" :key="`instance-${index}`"
                     :class="index === activeInstanceIdx ? 'v-list-item--active' : ''"
                     @click="setActiveInstanceIdx(index)">
          <v-list-item-action :title="`Cluster health: ${item.status}`">
            <svg class="mb-1 mx-auto" height="14" width="14">
              <circle :class="`health--${item.status}`" cx="7" cy="9" r="5"/>
            </svg>
          </v-list-item-action>
          <v-list-item-content :title="`Switch to cluster at '${item.uri}'`">
            <v-list-item-title class="text-truncate" style="max-width: 400px;">
              {{ item.name }} <small class="grey--text">({{ item.uri }})</small>
            </v-list-item-title>
          </v-list-item-content>

          <rename-elasticsearch-instance :cluster-name="item.name" :cluster-uri="item.uri" :cluster-idx="index"/>

          <v-list-item-action :id="`remove-instance-${index}`"
                              title="Delete cluster"
                              class="ml-1"
                              @click.stop="removeInstance(index)">
            <v-btn icon small>
              <v-icon small>mdi-delete</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
  import store from '@/store'
  import { compositionVuexAccessors } from '@/helpers/store'
  import { computed, ref, watch, watchEffect } from '@vue/composition-api'
  import { checkHealth } from '@/helpers/instance'
  import { BASE_URI } from '@/consts'
  import NewElasticsearchInstance from '@/components/ElasticsearchInstance/NewElasticsearchInstance'
  import RenameElasticsearchInstance from '@/components/ElasticsearchInstance/RenameElasticsearchInstance'

  export default {
    name: 'elasticsearch-instance-selection',
    components: {
      NewElasticsearchInstance,
      RenameElasticsearchInstance
    },
    setup () {
      const menuOpen = ref(false)
      const modalOpen = ref(false)
      const {
        activeInstanceIdx,
        instances
      } = compositionVuexAccessors('connection', ['activeInstanceIdx', 'instances'])
      const activeInstance = computed(() => (store.getters['connection/activeInstance']))

      const checkAllInstances = () => (instances.value.forEach(checkHealth))
      watch(menuOpen, value => {
        if (value) checkAllInstances()
      })

      let getHealthInterval = null
      const setupHealthLoading = () => {
        checkHealth(activeInstance.value)
        if (getHealthInterval) clearInterval(getHealthInterval)

        getHealthInterval = setInterval(() => (checkHealth(activeInstance.value)), 30000)
      }

      const wasConnected = computed(() => (store.state.connection.instances.length > 0))
      watchEffect(() => {
        if (wasConnected.value) setupHealthLoading()
      })

      const setActiveInstanceIdx = index => {
        store.commit('connection/setActiveInstanceIdx', index)
        window.location.replace(BASE_URI)
      }

      const removeInstance = index => {
        if (confirm(`Delete cluster '${instances.value[index].name}' (${instances.value[index].uri})?`)) {
          let reload
          if (index === activeInstanceIdx.value) reload = true
          store.commit('connection/removeInstance', index)
          if (reload) window.location.replace(BASE_URI)
        }
      }

      return {
        modalOpen,
        menuOpen,
        activeInstanceIdx,
        activeInstance,
        instances,
        setActiveInstanceIdx,
        removeInstance
      }
    }
  }
</script>
