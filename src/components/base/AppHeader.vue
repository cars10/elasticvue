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
        <q-route-tab class="full-height" :label="t('base.app_header.navigation.home')" :to="{name: 'home'}" exact />
        <q-route-tab :label="t('base.app_header.navigation.nodes')" :to="{name: 'nodes'}" />
        <q-route-tab :label="t('base.app_header.navigation.shards')" :to="{name: 'shards'}" />
        <q-route-tab :label="t('base.app_header.navigation.indices')" :to="{name: 'indices'}"
                     data-testid="header-indices" />
        <q-route-tab :label="t('base.app_header.navigation.search')" :to="{name: 'search'}" />
        <q-route-tab :label="t('base.app_header.navigation.rest')" :to="{name: 'rest'}" />
        <q-route-tab :label="t('base.app_header.navigation.snapshots')" :to="{name: 'snapshot_repositories'}" />
        <q-route-tab icon="settings" :to="{name: 'settings'}" />
      </q-tabs>
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
  import { useLogo } from '../../composables/Logo'
  import ClusterSelection from '../clusterselection/ClusterSelection.vue'
  import { useTranslation } from '../../composables/i18n.ts'

  const t = useTranslation()
  const logo = useLogo()
</script>
