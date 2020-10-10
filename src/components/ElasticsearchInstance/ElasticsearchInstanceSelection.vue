<template>
  <div>
    <v-menu v-model="menuOpen" offset-y>
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-if="activeInstance" v-bind="attrs"
               :title="`Connected to '${activeInstance.name}' (${activeInstance.uri})`" class="text-none" v-on="on">
          <svg :title="`Cluster health: ${activeInstance.status}`" height="14" width="14" class="mr-2">
            <circle :class="`health--${activeInstance.status}`" cx="7" cy="9" r="5"/>
          </svg>
          <span style="max-width: 200px" class="text-truncate">{{ activeInstance.name }}</span>
          <v-icon v-if="menuOpen">mdi-menu-up</v-icon>
          <v-icon v-else>mdi-menu-down</v-icon>
        </v-btn>
        <v-btn v-else v-bind="attrs" class="text-none" v-on="on">
          Chose instance
          <v-icon v-if="menuOpen">mdi-menu-up</v-icon>
          <v-icon v-else>mdi-menu-down</v-icon>
        </v-btn>
      </template>

      <v-list>
        <new-elasticsearch-instance :modal-open="modalOpen"/>
        <v-divider class="mt-2"/>

        <v-list-item v-for="(item, index) in instances" :key="`instance-${index}`"
                     :class="index === activeInstanceIdx ? 'v-list-item--active' : ''"
                     @click="setActiveInstanceIdx(index)">
          <v-list-item-action :title="`Cluster health: ${item.status}`">
            <svg height="14" width="14" class="mb-1 mx-auto">
              <circle :class="`health--${item.status}`" cx="7" cy="9" r="5"/>
            </svg>
          </v-list-item-action>
          <v-list-item-content :title="`Switch to cluster at '${item.uri}'`">
            <v-list-item-title class="text-truncate" style="max-width: 400px;">
              {{ item.name }} <small class="grey--text">({{ item.uri }})</small>
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-action @click="removeInstance(index)">
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
  import NewElasticsearchInstance from '@/components/ElasticsearchInstance/NewElasticsearchInstance'
  import { checkHealth } from '@/helpers/instance'
  import { BASE_URI } from '@/consts'

  export default {
    components: {
      NewElasticsearchInstance
    },
    setup () {
      const menuOpen = ref(false)
      const modalOpen = ref(false)
      const { activeInstanceIdx, instances } = compositionVuexAccessors('connection', ['activeInstanceIdx', 'instances'])
      const activeInstance = computed(() => (store.getters['connection/activeInstance']))

      const checkAllInstances = () => (instances.value.forEach(checkHealth))
      watch(menuOpen, value => {
        if (value) checkAllInstances()
      })

      let getHealthInterval = null
      const setupHealthLoading = () => {
        checkHealth(activeInstance.value)
        if (getHealthInterval) clearInterval(getHealthInterval)

        getHealthInterval = setInterval(() => (checkHealth(activeInstance.value)), 3000)
      }

      const wasConnected = computed(() => (store.state.connection.wasConnected))
      watchEffect(() => {
        if (wasConnected.value) setupHealthLoading()
      })

      const setActiveInstanceIdx = index => {
        store.commit('connection/setActiveInstanceIdx', index)
        window.location.replace(BASE_URI)
      }

      const removeInstance = index => {
        if (confirm(`Remove cluster '${instances.value[index].name}'?`)) {
          store.commit('connection/removeInstance', index)
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
