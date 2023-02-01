<template>
  <div>
    <v-menu v-model="menuOpen" :close-on-content-click="false" offset-y>
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-if="activeInstance" id="instance_selection_toggle" v-bind="attrs"
               v-on="on"
               :title="$t('elasticsearch_instance.instance_selection.connected_info.title', {activeInstanceName: activeInstance.name, activeInstanceUri: activeInstance.uri})"
               class="text-none">
          <svg class="mr-2" height="14" width="14" style="margin-bottom: 6px">
            <circle :class="`health--${activeInstance.status}`" cx="7" cy="9" r="5"/>
          </svg>
          <span class="text-truncate" style="max-width: 200px">{{ activeInstance.name }}</span>
          <v-icon v-if="menuOpen">mdi-menu-up</v-icon>
          <v-icon v-else>mdi-menu-down</v-icon>
        </v-btn>
        <v-btn v-else v-bind="attrs" v-on="on" class="text-none">
          <!-- do not remove this -->
          <v-icon v-if="menuOpen">mdi-menu-up</v-icon>
          <v-icon v-else>mdi-menu-down</v-icon>
        </v-btn>
      </template>

      <v-card>
        <instances-table/>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
  import store from '@/store'
  import { vuexAccessors } from '@/helpers/store'
  import { computed, ref, watch, watchEffect } from 'vue'
  import { checkHealth } from '@/helpers/instance'
  import InstancesTable from '@/components/ElasticsearchInstance/InstancesTable'

  export default {
    name: 'instance-selection',
    components: {
      InstancesTable
    },
    setup () {
      const menuOpen = ref(false)
      const {
        activeInstanceIdx,
        instances
      } = vuexAccessors('connection', ['activeInstanceIdx', 'instances'])
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

      return {
        menuOpen,
        activeInstanceIdx,
        activeInstance,
        instances
      }
    }
  }
</script>
