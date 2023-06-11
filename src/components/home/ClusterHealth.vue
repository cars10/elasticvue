<template>
  <q-card data-testid="cluster-health">
    <q-card-section>
      <h2 class="text-h5 q-my-none">{{ t('home.cluster_health.heading') }}</h2>
    </q-card-section>

    <q-card-section class="font-14 q-px-none">
      <loader-status :request-state="requestState">
        <q-list v-if="data" dense>
          <q-item v-for="key in Object.keys(data)" :key="key">
            <q-item-section>
              <q-item-label>{{ key }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ data[key] }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </loader-status>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import LoaderStatus from '../shared/LoaderStatus.vue'
  import { useElasticsearchRequest } from '../../composables/CallElasticsearch'
  import { useTranslation } from '../../composables/i18n.ts'

  const t = useTranslation()

  const { requestState, data, load } = useElasticsearchRequest<Record<string, string>>('clusterHealth')
  onMounted(load)
</script>
