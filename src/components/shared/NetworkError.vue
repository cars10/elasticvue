<template>
  <q-banner class="bg-grey-medium q-pa-md">
    <p>
      {{ $t('shared.loader.network_error') }}
      {{ $t('shared.loader.cluster_uri') }}
      <a target="_blank" :href="connectionStore.activeCluster.uri">{{ connectionStore.activeCluster.uri }}</a>
    </p>

    <q-btn icon="cached" label="Reload" color="visible-bg" @click="reload" />
  </q-banner>
</template>

<script setup>
  import { useConnectionStore } from '../../store/connection'

  const connectionStore = useConnectionStore()
  const reload = () => (window.location.reload())
</script>