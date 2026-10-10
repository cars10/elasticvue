<template>
  <div class="flex justify-between items-center q-mb-md">
    <div class="text-h5">{{ t('home.heading') }}</div>
    <div v-if="!connectionStore.serverless" class="col-auto">
      <reload-button :action="reload" v-model="reloadInterval" />
    </div>
  </div>

  <div v-if="connectionStore.serverless" class="row">
    <div class="col-12 col-md-8 col-lg-6">
      <q-card>
        <q-card-section>
          <div class="text-subtitle2 text-weight-medium">
            <q-icon name="info" class="q-mr-sm" />
            Serverless
          </div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          Your cluster is running in
          <a href="https://www.elastic.co/docs/deploy-manage/deploy/elastic-cloud/serverless" target="_blank"> serverless mode</a
          >, which significantly limits the functionality of Elasticvue due to many unavailable APIs.
        </q-card-section>
      </q-card>
    </div>
  </div>

  <div v-else class="row q-col-gutter-lg">
    <HomeStatus ref="homeStatus" :reload-interval="reloadInterval" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useConnectionStore } from '../../store/connection.ts'
import { useTranslation } from '../../composables/i18n.ts'
import HomeStatus from './HomeStatus.vue'
import ReloadButton from '../shared/ReloadButton.vue'

const t = useTranslation()
const connectionStore = useConnectionStore()
const homeStatus = ref<InstanceType<typeof HomeStatus> | null>(null)
const reloadInterval = ref<number | null>(3)

const reload = () => homeStatus.value?.refresh()
</script>
