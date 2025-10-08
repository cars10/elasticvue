<template>
  <div class="row q-pt-sm">
    <div class="col-lg-8 offset-lg-2">
      <div class="row q-col-gutter-lg justify-center">
        <div v-if="connectionStore.serverless" class="col-12">
          <div class="row q-col-gutter-lg justify-center">
            <div class="col-6">
              <q-card>
                <q-card-section>
                  <h2 class="text-h5 q-my-none">
                    <q-icon name="info" />
                    Serverless
                  </h2>
                </q-card-section>
                <q-card-section>
                  Your cluster is running in
                  <a href="https://www.elastic.co/docs/deploy-manage/deploy/elastic-cloud/serverless" target="_blank">
                    serverless mode. </a
                  >, which significantly limits the functionality of Elasticvue due to many unavailable APIs.
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <HomeStatus v-if="!connectionStore.serverless" />

        <div class="col-6">
          <ClusterInformation />
        </div>

        <div v-if="!connectionStore.serverless" class="col-6">
          <ClusterHealth />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ClusterHealth from './ClusterHealth.vue'
import ClusterInformation from './ClusterInformation.vue'
import { useConnectionStore } from '../../store/connection.ts'
import HomeStatus from './HomeStatus.vue'

const connectionStore = useConnectionStore()
</script>
