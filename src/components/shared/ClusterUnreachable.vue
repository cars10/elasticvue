<template>
  <div class="row q-pa-lg">
    <q-card v-if="cluster" class="col-12 col-md-8 offset-md-2 col-lg-6 offset-lg-3" data-testid="cluster-unreachable">
      <q-card-section class="row no-wrap items-start q-gutter-md">
        <q-icon :name="icon" size="md" color="negative" />
        <div class="col" style="min-width: 0">
          <h2 class="text-h6 q-my-none" data-testid="cluster-unreachable-heading">{{ heading }}</h2>
          <a :href="cluster.uri" target="_blank" rel="noopener" class="text-muted font-mono word-break-all">{{ cluster.uri }}</a>
        </div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <p v-if="session.error?.message" class="font-mono text-negative word-break-all" data-testid="cluster-unreachable-error">
          {{ session.error.message }}
        </p>

        <template v-if="kind === 'cors'">
          <div class="q-mb-sm">{{ t('shared.cluster_unreachable.cors_hint') }}</div>
          <configure-help />
        </template>
        <template v-else-if="kind === 'network'">
          <div>{{ t('shared.cluster_connection_errors.please_check') }}</div>
          <ul class="q-pl-md q-mt-xs q-mb-sm">
            <li>{{ t('shared.cluster_connection_errors.checklist.reachable') }} {{ cluster.uri }}</li>
            <li v-if="buildConfig.hints.ssl && ssl">{{ t('shared.cluster_connection_errors.checklist.ssl') }}</li>
            <li v-if="buildConfig.hints.cors && session.error?.cors === undefined">
              {{ t('shared.cluster_connection_errors.checklist.cors') }}
            </li>
          </ul>
          <a
            href="https://github.com/cars10/elasticvue/blob/master/docs/debugging-connection-issues.md"
            target="_blank"
            rel="noopener"
          >
            {{ t('shared.cluster_unreachable.help') }}
          </a>
        </template>
        <div v-else-if="kind === 'auth'">{{ t('shared.cluster_unreachable.auth_hint') }}</div>
        <div v-else>{{ t('shared.cluster_unreachable.api_hint') }}</div>

        <div class="text-muted font-13 q-mt-md">{{ t('shared.cluster_unreachable.auto_retry') }}</div>
      </q-card-section>

      <q-separator />

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat :label="t('clusters.all')" :to="{ name: 'clusters', params: { clusterId: cluster.id } }" />
        <edit-cluster v-if="!cluster.predefined" :id="cluster.id" :label="t('cluster_selection.edit_cluster.heading')" />
        <q-btn
          icon="refresh"
          :label="t('shared.cluster_unreachable.retry')"
          unelevated
          color="primary-dark"
          data-testid="cluster-unreachable-retry"
          @click="session.reconnect()"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConnectionStore } from '../../store/connection.ts'
import { useClusterSession } from '../../store/clusterSession.ts'
import { useTranslation } from '../../composables/i18n.ts'
import { buildConfig } from '../../buildConfig.ts'
import EditCluster from '../clusterselection/EditCluster.vue'
import ConfigureHelp from '../setup/ConfigureHelp.vue'

const t = useTranslation()
const connectionStore = useConnectionStore()
const session = useClusterSession()

const cluster = computed(() => connectionStore.activeCluster)
const ssl = computed(() => /^https/.test(cluster.value?.uri ?? ''))

const kind = computed(() => {
  const status = session.error?.status ?? 0
  if (status === 0) return session.error?.cors ? 'cors' : 'network'
  if (status === 401 || status === 403) return 'auth'
  return 'api'
})

const icon = computed(() => {
  if (kind.value === 'network') return 'cloud_off'
  if (kind.value === 'cors') return 'block'
  if (kind.value === 'auth') return 'lock'
  return 'error_outline'
})

const heading = computed(() => {
  const name = cluster.value?.name
  if (kind.value === 'network') return t('shared.cluster_unreachable.heading_network', { name })
  if (kind.value === 'cors') return t('shared.cluster_unreachable.heading_cors', { name })
  if (kind.value === 'auth') return t('shared.cluster_unreachable.heading_auth', { name })
  return t('shared.cluster_unreachable.heading_api', { name })
})
</script>
