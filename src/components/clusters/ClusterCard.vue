<template>
  <q-card class="full-height cursor-pointer" tabindex="0" data-testid="cluster-card">
    <q-card-section class="row no-wrap items-start">
      <div class="col" style="min-width: 0">
        <div class="text-subtitle1 text-weight-bold ellipsis">
          {{ cluster.name }}
          <q-chip v-if="active" color="positive" text-color="white" class="text-weight-regular" dense>active</q-chip>
        </div>
        <div v-if="cluster.clusterName !== cluster.name" class="text-muted ellipsis">{{ cluster.clusterName }}</div>
        <div v-if="cluster.version" class="q-mt-xs">{{ productName }} {{ cluster.version }}</div>
        <div class="text-muted font-13 font-mono ellipsis q-mt-xs">{{ cluster.uri }}</div>
      </div>
      <div class="col-auto q-pl-md">
        <q-spinner v-if="cluster.loading && !cluster.status" size="16px" />
        <health-badge v-else :status="cluster.status" />
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section v-if="!overview">
      <q-skeleton type="text" />
      <q-skeleton type="text" />
    </q-card-section>

    <q-card-section v-else-if="!overview.stats" class="text-muted">
      {{ cluster.status === 'unknown' ? t('clusters.unreachable') : t('clusters.stats_unavailable') }}
    </q-card-section>

    <template v-else>
      <q-card-section>
        <div class="row q-col-gutter-sm">
          <div v-for="metric in metrics" :key="metric.key" class="col-6 col-sm-3 column items-center">
            <percent-pie-chart
              :value="overview[metric.key]"
              :warn-at="metric.warnAt"
              :danger-at="metric.dangerAt"
              :higher-is-better="metric.key === 'shards'"
              :size="64"
            />
            <div class="text-muted font-13 q-mt-xs">{{ metric.label }}</div>
          </div>
        </div>
        <div v-if="!overview.nodesAvailable" class="text-muted font-13 text-center q-mt-sm">
          {{ t('home.monitoring_required') }}
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="font-13">
        <div class="row q-gutter-x-lg">
          <i18n-t keypath="home.overview.nodes" :plural="overview.stats.nodes.count.total" tag="div">
            <template #count>
              <b>{{ overview.stats.nodes.count.total }}</b>
            </template>
          </i18n-t>
          <i18n-t keypath="home.overview.indices" :plural="overview.stats.indices.count" tag="div">
            <template #count>
              <b>{{ overview.stats.indices.count }}</b>
            </template>
          </i18n-t>
          <i18n-t keypath="home.overview.docs" :plural="overview.stats.indices.docs.count" tag="div">
            <template #count>
              <b>{{ overview.stats.indices.docs.count.toLocaleString() }}</b>
            </template>
          </i18n-t>
          <i18n-t keypath="home.overview.disk" tag="div">
            <template #size>
              <b>{{ prettyPrintByteString(overview.stats.indices.store.size_in_bytes) }}</b>
            </template>
          </i18n-t>
        </div>
      </q-card-section>
    </template>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PercentPieChart from '../shared/PercentPieChart.vue'
import HealthBadge from '../shared/HealthBadge.vue'
import { ElasticsearchCluster } from '../../store/connection.ts'
import { useTranslation } from '../../composables/i18n.ts'
import type { ClusterSummary } from '../../composables/components/clusters/ClustersOverview.ts'
import { prettyPrintByteString } from '../../helpers/bytes.ts'
import { DISTRIBUTIONS } from '../../consts.ts'
import { CPU_THRESHOLDS, DISK_THRESHOLDS, HEAP_THRESHOLDS } from '../../helpers/pressure.ts'

const props = defineProps<{
  cluster: ElasticsearchCluster
  overview?: ClusterSummary
  active: boolean
}>()

const t = useTranslation()

const metrics = computed(
  () =>
    [
      { key: 'cpu', label: t('home.metrics.cpu'), warnAt: CPU_THRESHOLDS.warn, dangerAt: CPU_THRESHOLDS.danger },
      { key: 'heap', label: t('home.metrics.heap'), warnAt: HEAP_THRESHOLDS.warn, dangerAt: HEAP_THRESHOLDS.danger },
      { key: 'disk', label: t('home.metrics.disk'), warnAt: DISK_THRESHOLDS.warn, dangerAt: DISK_THRESHOLDS.danger },
      { key: 'shards', label: t('home.metrics.shards'), warnAt: 100, dangerAt: props.cluster.status === 'red' ? 101 : 0 }
    ] as const
)

const productName = computed(() => (props.cluster.distribution === DISTRIBUTIONS.opensearch ? 'OpenSearch' : 'Elasticsearch'))
</script>
