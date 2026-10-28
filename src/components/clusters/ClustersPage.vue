<template>
  <div class="flex justify-between items-center q-mb-lg">
    <h1 class="page-title">{{ t('clusters.heading') }}</h1>
    <reload-button :action="refresh" v-model="clustersStore.reloadInterval" />
  </div>

  <div class="row q-col-gutter-md">
    <div v-for="(cluster, index) in connectionStore.clusters" :key="index" class="col-12 col-md-6 col-xl-4">
      <cluster-card
        :cluster="cluster"
        :overview="overviews[index]"
        :active="index === connectionStore.activeClusterIndex"
        @click="open(index)"
        @keyup.enter="open(index)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import ReloadButton from '../shared/ReloadButton.vue'
import ClusterCard from './ClusterCard.vue'
import { useConnectionStore } from '../../store/connection.ts'
import { useClustersStore } from '../../store/clusters.ts'
import { useTranslation } from '../../composables/i18n.ts'
import { useClustersOverview } from '../../composables/components/clusters/ClustersOverview.ts'
import { reloadHomePage } from '../../helpers/router.ts'

const t = useTranslation()
const router = useRouter()
const connectionStore = useConnectionStore()
const clustersStore = useClustersStore()
const { overviews, refresh } = useClustersOverview()

const open = (index: number) =>
  index === connectionStore.activeClusterIndex
    ? router.push({ name: 'home', params: { clusterIndex: index } })
    : reloadHomePage(router, index, 'home')
</script>
