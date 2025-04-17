<template>
  <q-header class="bg-default shadow-3">
    <q-toolbar style="height: 64px">
      <img :src="logo" alt="logo" height="48" width="48">
      <q-toolbar-title>
        <router-link :to="{name: 'home', params: {clusterIndex: 1}}" class="decoration-none">
          Elasticvue
        </router-link>
        <cluster-selection class="q-ml-lg q-my-sm" />
      </q-toolbar-title>

      <q-tabs stretch>
        <q-route-tab class="full-height" :label="t('base.app_header.navigation.home')" :to="{name: 'home'}" exact
                     :ripple="false" />
        <q-route-tab v-if="!connectionStore.serverless" id="nodes" :label="t('base.app_header.navigation.nodes')" :to="{name: 'nodes'}" :ripple="false" />
        <q-route-tab v-if="!connectionStore.serverless" id="shards" :label="t('base.app_header.navigation.shards')" :to="{name: 'shards'}"
                     :ripple="false" />
        <q-route-tab id="indices" :label="t('base.app_header.navigation.indices')" :to="{name: 'indices'}"
                     :ripple="false" />
        <q-route-tab id="search" :label="t('base.app_header.navigation.search')" :to="{name: 'search'}"
                     :ripple="false" />
        <q-route-tab id="rest" :label="t('base.app_header.navigation.rest')" :to="{name: 'rest'}" :ripple="false" />
        <q-route-tab v-if="!connectionStore.serverless" :label="t('base.app_header.navigation.snapshots')" :to="{name: 'snapshot_repositories'}"
                     :ripple="false" />
        <q-route-tab id="settings" icon="settings" :to="{name: 'settings'}" :ripple="false" />
      </q-tabs>
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
  import { useLogo } from '../../composables/Logo'
  import ClusterSelection from '../clusterselection/ClusterSelection.vue'
  import { useTranslation } from '../../composables/i18n.ts'
  import {useConnectionStore} from '../../store/connection.ts'

  const t = useTranslation()
  const logo = useLogo()
  const connectionStore = useConnectionStore()
</script>
