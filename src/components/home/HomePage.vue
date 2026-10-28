<template>
  <div class="flex justify-between items-center q-mb-lg">
    <h1 class="page-title">{{ t('home.heading') }}</h1>
    <div v-if="!connectionStore.serverless" class="col-auto">
      <reload-button :action="reload" v-model="homeStore.reloadInterval" />
    </div>
  </div>

  <div v-if="connectionStore.serverless" class="row">
    <div class="col-12 col-md-8 col-lg-6">
      <q-card>
        <q-card-section>
          <div class="card-title">
            <q-icon name="info" size="18px" />
            {{ t('home.serverless.title') }}
          </div>
          <i18n-t keypath="home.serverless.text" tag="div">
            <template #link>
              <a href="https://www.elastic.co/docs/deploy-manage/deploy/elastic-cloud/serverless" target="_blank">{{
                t('home.serverless.link')
              }}</a>
            </template>
          </i18n-t>
        </q-card-section>
      </q-card>
    </div>
  </div>

  <div v-else class="row q-col-gutter-md">
    <HomeStatus ref="homeStatus" :reload-interval="homeStore.reloadInterval" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useConnectionStore } from '../../store/connection.ts'
import { useHomeStore } from '../../store/home.ts'
import { useTranslation } from '../../composables/i18n.ts'
import HomeStatus from './HomeStatus.vue'
import ReloadButton from '../shared/ReloadButton.vue'

const t = useTranslation()
const connectionStore = useConnectionStore()
const homeStore = useHomeStore()
const homeStatus = ref<InstanceType<typeof HomeStatus> | null>(null)

const reload = () => homeStatus.value?.refresh()
</script>
