<template>
  <q-btn color="dark-grey" no-caps :title="btnTitle" data-testid="cluster-selection">
    <cluster-status-indicator :status="connectionStore.activeCluster.status"
                              :loading="connectionStore.activeCluster.loading" />

    <span class="ellipsis" style="max-width: 200px">{{ connectionStore.activeCluster.name }}</span>

    <q-icon :name="menuOpen ? 'expand_less' : 'expand_more'" />

    <q-menu v-model="menuOpen">
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
  import { useClusterHealth } from '../../composables/ClusterHealth'
  import { useConnectionStore } from '../../store/connection'

  const t = useTranslation()
  const connectionStore = useConnectionStore()
  const menuOpen = ref(false)

  const btnTitle = computed(() => {
    return t('elasticsearch_instance.instance_selection.connected_info.title', {
      activeInstanceName: connectionStore.activeCluster?.name,
      activeInstanceUri: connectionStore.activeCluster?.uri
    })
  })

  const { checkAllClusters } = useClusterHealth()

  watch(menuOpen, value => {
    if (value) checkAllClusters()
  })
</script>
