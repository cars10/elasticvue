<template>
  <q-card>
    <q-card-section>
      <h2 class="text-h5 q-my-none">{{ $t('home.cluster_health.heading') }}</h2>
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

<script setup>
  import { onMounted } from 'vue'
  import LoaderStatus from '../shared/LoaderStatus.vue'
  import { useElasticsearchRequest } from '../../composables/CallElasticsearch'

  const { requestState, data, load } = useElasticsearchRequest('clusterHealth')
  onMounted(load)
</script>
