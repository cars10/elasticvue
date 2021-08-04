<template>
  <loader :request-state="requestState">
    <v-alert v-if="validPathRepo" :value="true" type="success">
      <span v-html="$t('shared.path-repo-info.success-1')"></span><br>
      {{ $t('shared.path-repo-info.success-2') }} {{ pathRepo }}
      <v-btn aria-label="Reload path.repo info" icon small title="Reload path.repo info" @click.native="load">
        <v-icon small>mdi-reload</v-icon>
      </v-btn>
    </v-alert>
    <v-alert v-else :value="true" type="error">
      <span v-html="$t('shared.path-repo-info.error-1')"></span><br>
      <span v-html="$t('shared.path-repo-info.error-2')"></span><br>
      <a href="https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-snapshots.html"
         rel="nofollow" target="_blank">{{ $t('shared.path-repo-info.docs') }}</a>
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
