<template>
  <loader :request-state="requestState">
    <v-alert v-if="validPathRepo" :value="true" type="success">
      Your <strong>path.repo</strong> setting seems to be setup correctly, that means you can use repositories and
      snapshots. <br>
      The current value is: {{ pathRepo }}
      <v-btn aria-label="Reload path.repo info" icon small title="Reload path.repo info" @click.native="load">
        <v-icon small>mdi-reload</v-icon>
      </v-btn>
    </v-alert>
    <v-alert v-else :value="true" type="error">
      Your <strong>path.repo</strong> setting is not setup correctly.<br>
      You have to set <strong>path.repo</strong> in your <strong>elasticsearch.yml</strong> if you want to use snapshots
      and repositories.
      <br>
      <a href="https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-snapshots.html"
         rel="nofollow" target="_blank">Docs</a>
      <v-btn aria-label="Reload path.repo info" icon small title="Reload path.repo info" @click.native="load">
        <v-icon small>mdi-reload</v-icon>
      </v-btn>
    </v-alert>
  </loader>
</template>

<script>
  import Loader from '@/components/shared/Loader'
  import { setupElasticsearchRequest } from '@/mixins/RequestComposition'
  import { computed, onMounted } from '@vue/composition-api'

  export default {
    name: 'path-repo-info',
    components: {
      Loader
    },
    setup () {
      const { load, requestState, data } = setupElasticsearchRequest('clusterSettings')
      onMounted(load)

      const pathRepo = computed(() => {
        if (!data.value) return ''
        if (!data.value.defaults) return ''
        if (!data.value.defaults.path) return ''
        return data.value.defaults.path.repo
      })

      const validPathRepo = computed(() => {
        return pathRepo.value.length > 0
      })

      return {
        load,
        requestState,
        data,
        pathRepo,
        validPathRepo
      }
    }
  }
</script>
