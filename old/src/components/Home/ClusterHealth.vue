<template>
  <v-card>
    <v-card-title>
      {{ $t('home.cluster_health.heading') }}
      <reload-button id="reload-cluster-health" :action="load"/>
    </v-card-title>
    <v-divider/>

    <loader :request-state="requestState">
      <v-list v-if="data" class="text--small" dense>
        <v-list-item v-for="key in Object.keys(data)" :key="key">
          <v-list-item-content>{{ key }}</v-list-item-content>
          <v-list-item-content>
            <span class="text-right">{{ data[key] }}</span>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </loader>
  </v-card>
</template>

<script>
  import { setupElasticsearchRequest } from '@/mixins/RequestComposition'
  import ReloadButton from '@/components/shared/ReloadButton'
  import Loader from '@/components/shared/Loader'
  import { onMounted } from 'vue'

  export default {
    name: 'cluster-health',
    components: {
      ReloadButton,
      Loader
    },
    setup () {
      const { load, requestState, data } = setupElasticsearchRequest('clusterHealth')
      onMounted(load)

      return {
        load,
        requestState,
        data
      }
    }
  }
</script>
