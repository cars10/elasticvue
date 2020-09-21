<template>
  <v-menu v-model="open" offset-y>
    <template v-slot:activator="{ on, attrs }">
      <v-btn v-bind="attrs" :title="`Connected to ${elasticsearchHost.uri}`" class="text-none" v-on="on">
        <span :title="`Cluster health: ${elasticsearchHost.status}`">
          <svg height="14" width="14" class="mr-2">
            <circle :class="`health--${elasticsearchHost.status}`" cx="7" cy="9" r="5"/>
          </svg>
        </span>
        {{ elasticsearchHost.name }}
        <span>
          <v-icon v-if="open">mdi-menu-up</v-icon>
          <v-icon v-else>mdi-menu-down</v-icon>
        </span>
      </v-btn>
    </template>

    <v-list>
      <v-list-item ripple @click="() => {}">
        <v-list-item-action>
          <v-icon>mdi-plus</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Add elasticsearch instance</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-divider class="mt-2"/>

      <v-list-item v-for="(item, index) in elasticsearchInstances" :key="`${index}-${item.name}-${item.uri}`"
                   @click="setElasticsearchHost(item)">
        <v-list-item-action :title="`Cluster health: ${item.status}`">
          <svg height="14" width="14" class="mb-1 mx-auto">
            <circle :class="`health--${item.status}`" cx="7" cy="9" r="5"/>
          </svg>
        </v-list-item-action>
        <v-list-item-content :title="`Switch to cluster at '${item.uri}'`">
          <v-list-item-title>
            {{ item.name }} <small class="grey--text">({{ item.uri }})</small>
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-action @click="removeElasticsearchInstance(index)">
          <v-btn icon small>
            <v-icon small>mdi-delete</v-icon>
          </v-btn>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
  import store from '@/store'
  import ElasticsearchAdapter from '@/services/ElasticsearchAdapter'
  import { compositionVuexAccessors } from '@/helpers/store'
  import { computed, ref, watch } from '@vue/composition-api'
  import { DefaultClient } from '@/models/clients/DefaultClient'
  import { CONNECTION_STATES } from '@/consts'

  export default {
    setup () {
      const { elasticsearchHost, elasticsearchInstances } = compositionVuexAccessors('connection', ['elasticsearchHost', 'elasticsearchInstances'])
      const open = ref(false)

      const checkHealth = instance => {
        instance.status = CONNECTION_STATES.UNKNOWN
        const adapter = new ElasticsearchAdapter(new DefaultClient(instance.uri))

        adapter
          .clusterHealth()
          .then(result => result.json())
          .then(body => (instance.status = body.status))
          .catch(() => (instance.status = CONNECTION_STATES.UNKNOWN))
      }

      const checkAllInstances = () => {
        elasticsearchInstances.value.forEach(checkHealth)
      }
      watch(open, value => {
        if (value) checkAllInstances()
      })

      let getHealthInterval = null
      const setupHealthLoading = () => {
        checkHealth(elasticsearchHost.value)
        if (getHealthInterval) clearInterval(getHealthInterval)

        getHealthInterval = setInterval(() => {
          checkHealth(elasticsearchHost.value)
        }, 3000)
      }

      const wasConnected = computed(() => {
        return store.state.connection.wasConnected
      })
      watch(wasConnected, newValue => {
        if (newValue) setupHealthLoading()
      })
      if (wasConnected.value) setupHealthLoading()

      const setElasticsearchHost = item => {
        store.commit('connection/setElasticsearchHost', item)
      }

      const removeElasticsearchInstance = index => {
        if (confirm(`Remove cluster '${elasticsearchInstances.value[index].name}'?`)) {
          store.commit('connection/removeElasticsearchInstance', index)
        }
      }

      return {
        open,
        elasticsearchHost,
        elasticsearchInstances,
        setElasticsearchHost,
        removeElasticsearchInstance
      }
    }
  }
</script>
