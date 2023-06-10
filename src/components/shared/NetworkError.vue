<template>
  <q-card>
    <q-banner class="q-pa-md bg-default">
      <p>
        {{ t('shared.loader.network_error') }}
        {{ t('shared.loader.cluster_uri') }}
        <a target="_blank" :href="connectionStore.activeCluster.uri">{{ connectionStore.activeCluster.uri }}</a>
      </p>

      <q-btn icon="cached" label="Reload" color="dark-grey" @click="reload" />
    </q-banner>
  </q-card>
</template>

<script setup>
  import { useConnectionStore } from '../../store/connection'
  import { useTranslation } from '../../composables/i18n'

  const connectionStore = useConnectionStore()
  const reload = () => (window.location.reload())
  const t = useTranslation()
</script>