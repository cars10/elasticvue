<template>
  <q-banner class="text-white bg-grey-9 border-l-8 border-negative q-mt-xl q-py-md">
    <template #avatar>
      <q-icon name="error" />
    </template>

    <div>
      <p v-if="errorMessage" class="text-bold">{{ errorMessage }}</p>
      <p v-else class="text-bold">{{ t('shared.cluster_connection_errors.connection_error') }}</p>

      <p>
        {{ t('shared.cluster_connection_errors.cant_connect') }}
        {{ t('shared.cluster_connection_errors.please_check') }}
      </p>

      <ul class="q-pl-lg q-my-sm">
        <li>
          {{ t('shared.cluster_connection_errors.checklist.reachable') }}
          <a :href="credentialsUri" target="_blank">{{ cluster.uri }}</a>
        </li>
        <li v-if="buildConfig.hints.ssl && ssl">{{ t('shared.cluster_connection_errors.checklist.ssl') }}</li>
        <li v-if="buildConfig.hints.cors">{{ t('shared.cluster_connection_errors.checklist.cors') }}</li>
      </ul>
    </div>
  </q-banner>
</template>

<script setup lang="ts">
  import { useTranslation } from '../../composables/i18n.ts'
  import { buildConfig } from '../../buildConfig.ts'
  import { computed, UnwrapRef } from 'vue'
  import { uriWithCredentials } from '../../helpers/elasticsearchAdapter.ts'
  import { AuthType, ElasticsearchClusterConnection } from '../../store/connection.ts'

  const props = defineProps<{
    cluster: ElasticsearchClusterConnection | UnwrapRef<ElasticsearchClusterConnection>,
    errorMessage?: string
  }>()
  const t = useTranslation()

  type AuthData = { username: undefined | string, password: undefined | string }

  const credentialsUri = computed(() => {
    const authData: AuthData = {
      username: undefined,
      password: undefined
    }

    if (props.cluster.auth.authType === AuthType.basicAuth) {
      authData.username = props.cluster.auth.authData.username
      authData.password = props.cluster.auth.authData.password
    }

    return uriWithCredentials({ uri: props.cluster.uri, ...authData })
  })

  const ssl = computed(() => (/^https/.test(props.cluster.uri)))
</script>