<template>
  <v-card>
    <v-card-title>
      Cluster Health
      <reload-button :action="load"/>
    </v-card-title>
    <v-divider/>

    <loader :request-state="requestState">
      <v-list class="text--small" dense>
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
  import { callApi } from '@/mixins/RequestComposition'
  import ReloadButton from '@/components/shared/ReloadButton'
  import Loader from '@/components/shared/Loader'
  import { onMounted } from '@vue/composition-api'

  export default {
    name: 'cluster-health',
    components: {
      ReloadButton,
      Loader
    },
    setup () {
      const { load, requestState, data } = callApi('clusterHealth')
      onMounted(load)

      return {
        load,
        requestState,
        data
      }
    }
  }
</script>
