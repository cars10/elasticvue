<template>
  <div class="flex justify-between items-center q-mb-lg">
    <h1 class="page-title">{{ t('home.heading') }}</h1>
    <div v-if="!session.capabilities.serverless" class="col-auto">
      <reload-button :action="refresh" :manual-action="() => refresh({ full: true })" v-model="homeStore.reloadInterval" />
    </div>
  </div>

  <div v-if="session.capabilities.serverless" class="row">
    <div class="col-12 col-md-8 col-lg-6">
      <q-card>
        <q-card-section>
          <div class="card-title">
            <q-icon name="info" size="18px" />
            {{ t('home.serverless.title') }}
          </div>
          <i18n-t scope="global" keypath="home.serverless.text" tag="div">
            <template #link>
              <a href="https://www.elastic.co/docs/deploy-manage/deploy/elastic-cloud/serverless" target="_blank">{{
                t('home.serverless.link')
              }}</a>
            </template>
          </i18n-t>
        </q-card-section>
      </q-card>
    </div>
  </div>

  <div v-else-if="stats" class="row q-col-gutter-md">
    <div class="col-12">
      <cluster-overview :stats="stats" :health="health" :status="clusterStatus" :version-label="versionLabel" />
    </div>

    <div class="col-12">
      <div class="row q-col-gutter-md" data-testid="cluster-capacity">
        <home-charts
          :max-cpu="maxCpu"
          :max-disk="maxDisk"
          :max-heap="maxHeap"
          :disk-watermarks="diskWatermarks"
          :nodes-monitoring-available="nodesMonitoringAvailable"
          :health="health"
          :stats="stats"
        />
      </div>
    </div>

    <div class="col-12">
      <home-attention :checks="attentionChecks" />
    </div>

    <div class="col-12">
      <div class="row q-col-gutter-md" data-testid="cluster-workload">
        <home-workload
          :workload="workload"
          :reload-interval="homeStore.reloadInterval"
          :tasks-summary="tasksSummary"
          :tasks-history="tasksHistory"
        />
      </div>
    </div>

    <div class="col-12 col-lg-6">
      <home-nodes
        :nodes="topNodes"
        :total-count="stats.nodes.count.total"
        :eligible-count="nodes.length"
        :nodes-monitoring-available="nodesMonitoringAvailable"
      />
    </div>

    <div class="col-12 col-lg-6">
      <home-indices :indices="attentionIndices" :total-count="attentionIndicesTotal" />
    </div>
  </div>

  <q-card v-else>
    <loader-status :request-state="statsRequestState" />
  </q-card>
</template>

<script setup lang="ts">
import { useClusterSession } from '../../store/clusterSession.ts'
import { useHomeStore } from '../../store/home.ts'
import { useTranslation } from '../../composables/i18n.ts'
import { useHomeDashboard } from '../../composables/components/home/HomeDashboard.ts'
import ClusterOverview from './ClusterOverview.vue'
import HomeAttention from './HomeAttention.vue'
import HomeCharts from './HomeCharts.vue'
import HomeIndices from './HomeIndices.vue'
import HomeNodes from './HomeNodes.vue'
import HomeWorkload from './HomeWorkload.vue'
import LoaderStatus from '../shared/LoaderStatus.vue'
import ReloadButton from '../shared/ReloadButton.vue'

const t = useTranslation()
const session = useClusterSession()
const homeStore = useHomeStore()

const {
  stats,
  statsRequestState,
  health,
  clusterStatus,
  nodes,
  topNodes,
  attentionIndices,
  attentionIndicesTotal,
  nodesMonitoringAvailable,
  diskWatermarks,
  workload,
  versionLabel,
  maxHeap,
  maxDisk,
  maxCpu,
  attentionChecks,
  tasksSummary,
  tasksHistory,
  refresh
} = useHomeDashboard()
</script>
