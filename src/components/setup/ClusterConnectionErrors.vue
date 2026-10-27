<template>
  <q-banner rounded class="tool-banner tool-banner--danger q-mt-md">
    <template #avatar>
      <q-icon name="error_outline" color="negative" />
    </template>

    <div class="text-weight-medium">{{ errorMessage || t('shared.cluster_connection_errors.connection_error') }}</div>
    <div class="q-mt-xs">
      {{ t('shared.cluster_connection_errors.cant_connect') }}
      {{ t('shared.cluster_connection_errors.please_check') }}
    </div>

    <ul class="q-pl-md q-mt-xs q-mb-none">
      <li>
        {{ t('shared.cluster_connection_errors.checklist.reachable') }}
        <a :href="credentialsUri" target="_blank" class="word-break-all">{{ cluster.uri }}</a>
      </li>
      <li v-if="buildConfig.hints.ssl && ssl">{{ t('shared.cluster_connection_errors.checklist.ssl') }}</li>
      <li v-if="buildConfig.hints.cors">{{ t('shared.cluster_connection_errors.checklist.cors') }}</li>
    </ul>
  </q-banner>
</template>

<script setup lang="ts">
import { useTranslation } from '../../composables/i18n.ts'
import { buildConfig } from '../../buildConfig.ts'
import { computed, UnwrapRef } from 'vue'
import { uriWithCredentials } from '../../helpers/elasticsearchAdapter.ts'
import { AuthType, ElasticsearchClusterConnection } from '../../store/connection.ts'

const props = defineProps<{
  cluster: ElasticsearchClusterConnection | UnwrapRef<ElasticsearchClusterConnection>
  errorMessage?: string
}>()
const t = useTranslation()

type AuthData = { username: undefined | string; password: undefined | string }

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

const ssl = computed(() => /^https/.test(props.cluster.uri))
</script>
