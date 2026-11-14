<template>
  <q-banner rounded class="tool-banner tool-banner--danger q-mt-md">
    <div class="row no-wrap items-center text-weight-medium">
      <q-icon name="error_outline" color="negative" size="xs" class="q-mr-xs" />
      {{ errorMessage || t('shared.cluster_connection_errors.connection_error') }}
    </div>
    <template v-if="cors">
      <div class="q-mt-xs q-mb-sm" data-testid="cluster-connection-cors">
        {{ t('shared.cluster_connection_errors.cors_blocked') }}
      </div>
      <configure-help />
    </template>
    <template v-else>
      <div class="q-mt-xs">
        {{ t('shared.cluster_connection_errors.cant_connect') }}
        {{ t('shared.cluster_connection_errors.please_check') }}
      </div>

      <ul class="q-pl-md q-mt-xs q-mb-none">
        <li>
          {{ t('shared.cluster_connection_errors.checklist.reachable') }}
          <a :href="cluster.uri" target="_blank" rel="noopener" class="word-break-all">{{ cluster.uri }}</a>
        </li>
        <li v-if="buildConfig.hints.ssl && ssl">{{ t('shared.cluster_connection_errors.checklist.ssl') }}</li>
        <li v-if="buildConfig.hints.cors && cors === undefined">
          {{ t('shared.cluster_connection_errors.checklist.cors') }}
        </li>
      </ul>
    </template>
  </q-banner>
</template>

<script setup lang="ts">
import { useTranslation } from '../../composables/i18n.ts'
import { buildConfig } from '../../buildConfig.ts'
import { computed, UnwrapRef } from 'vue'
import { ElasticsearchClusterConnection } from '../../store/connection.ts'
import ConfigureHelp from './ConfigureHelp.vue'

const props = defineProps<{
  cluster: ElasticsearchClusterConnection | UnwrapRef<ElasticsearchClusterConnection>
  errorMessage?: string
  cors?: boolean
}>()
const t = useTranslation()

const ssl = computed(() => /^https/.test(props.cluster.uri))
</script>
