<template>
  <loader :request-state="requestState">
    <v-alert v-if="validPathRepo" :value="true" type="success">
      <span v-html="$t('shared.path_repo_info.success.info')"></span><br>
      {{ $t('shared.path_repo_info.success.current_value') }} {{ pathRepo }}
      <v-btn aria-label="Reload path.repo info" icon small :title="$t('shared.path_repo_info.reload')"
             @click.native="load">
        <v-icon small>mdi-reload</v-icon>
      </v-btn>
    </v-alert>
    <v-alert v-else :value="true" type="error">
      <span v-html="$t('shared.path_repo_info.error.info')"></span><br>
      <a href="https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-snapshots.html"
         rel="nofollow" target="_blank">{{ $t('shared.path_repo_info.docs') }}</a>
      <v-btn aria-label="Reload path.repo info" icon small :title="$t('shared.path_repo_info.reload')"
             @click.native="load">
        <v-icon small>mdi-reload</v-icon>
      </v-btn>
    </v-alert>
  </loader>
</template>

<script>
  import Loader from '@/components/shared/Loader'
  import { computed, onMounted } from 'vue'
  import { usePathRepoInfo } from '@/mixins/PathRepoInfo'

  export default {
    name: 'path-repo-info',
    components: {
      Loader
    },
    setup () {
      const { load, requestState, pathRepo } = usePathRepoInfo()
      onMounted(load)

      const validPathRepo = computed(() => {
        return pathRepo.value.length > 0
      })

      return {
        load,
        requestState,
        pathRepo,
        validPathRepo
      }
    }
  }

</script>
