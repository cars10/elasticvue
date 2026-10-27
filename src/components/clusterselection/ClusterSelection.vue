<template>
  <q-btn
    flat
    no-caps
    dense
    :ripple="false"
    data-testid="cluster-selection"
    class="cluster-selection full-width"
    :class="{ 'cluster-selection--collapsed': collapsed }"
    :title="btnTitle"
  >
    <div class="flex no-wrap justify-between full-width font-13">
      <div class="flex no-wrap col overflow-hidden">
        <div class="flex items-center justify-center">
          <cluster-status-indicator
            :status="connectionStore.activeCluster?.status"
            :loading="connectionStore.activeCluster?.loading"
          />
        </div>

        <div class="col overflow-hidden">
          <div class="ellipsis text-left text-weight-bold" :title="btnTitle">{{ connectionStore.activeCluster?.name }}</div>

          <div class="flex no-wrap font-mono align-center">
            <div class="">
              {{ connectionStore.activeCluster?.version }}
            </div>
            <div class="flex items-center justify-center">
              <unsupported-version
                v-if="connectionStore.activeCluster && connectionStore.activeCluster.distribution === DISTRIBUTIONS.elasticsearch"
                :major-version="connectionStore.activeCluster.majorVersion"
                size="14px"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-center">
        <q-icon :name="menuOpen ? 'expand_less' : 'expand_more'" :size="collapsed ? '16px' : undefined" />
      </div>
    </div>

    <q-menu
      v-model="menuOpen"
      anchor="top right"
      transition-show="jump-right"
      transition-hide="jump-left"
      :transition-duration="150"
    >
      <div style="min-width: 650px">
        <cluster-table />
      </div>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ClusterTable from './ClusterTable.vue'
import ClusterStatusIndicator from './ClusterStatusIndicator.vue'
import { useTranslation } from '../../composables/i18n'
import { useClusterHealth } from '../../composables/components/home/ClusterHealth.ts'
import { useConnectionStore } from '../../store/connection'
import UnsupportedVersion from './UnsupportedVersion.vue'
import { DISTRIBUTIONS } from '../../consts.ts'

defineProps<{ collapsed?: boolean }>()

const t = useTranslation()
const connectionStore = useConnectionStore()
const menuOpen = ref(false)

const btnTitle = computed(() => {
  return t('cluster_selection.cluster_selection.connected_info.title', {
    activeInstanceName: connectionStore.activeCluster?.name,
    activeInstanceUri: connectionStore.activeCluster?.uri
  })
})

const { checkAllClusters } = useClusterHealth()

watch(menuOpen, (value) => {
  if (value) checkAllClusters()
})
</script>
