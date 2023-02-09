<template>
  <q-card>
    <q-card-section class="flex items-center">
      <h1 class="text-h5 q-my-none">
        {{ $t('home.cluster_health.heading') }}
      </h1>
      <reload-button :action="load" />
    </q-card-section>

    <q-separator />

    <q-card-section class="fontsize-14">
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
  import { useTranslation } from '../../composables/i18n'
  import LoaderStatus from '../shared/LoaderStatus.vue'
  import { useElasticsearchRequest } from '../../composables/CallElasticsearch'
  import ReloadButton from '../shared/ReloadButton.vue'

  const t = useTranslation()

  const { requestState, data, load } = useElasticsearchRequest('clusterHealth')
  onMounted(load)
</script>
