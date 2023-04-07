<template>
  <q-header class="bg-default shadow-3">
    <q-toolbar style="height: 64px">
      <img :src="logo" alt="logo" height="48" width="48">
      <q-toolbar-title>
        <router-link :to="{name: 'home', params: {instanceId: 1}}" class="decoration-none">
          Elasticvue
        </router-link>
        <cluster-selection class="q-ml-lg q-my-sm" />
      </q-toolbar-title>

      <q-tabs stretch>
        <q-route-tab class="full-height" label="Home" :to="{name: 'home'}" exact />
        <q-route-tab label="Nodes" :to="{name: 'nodes'}" exact />
        <q-route-tab label="Shards" :to="{name: 'shards'}" exact />
        <q-route-tab label="Indices" :to="{name: 'indices'}" exact />
        <q-route-tab label="Search" :to="{name: 'home'}" exact />
        <q-route-tab label="Rest" :to="{name: 'rest'}" exact />
        <q-route-tab label="Snapshots" :to="{name: 'snapshot_repositories'}" exact />
        <q-route-tab label="Utilities" :to="{name: 'home'}" exact />
        <q-route-tab icon="settings" :to="{name: 'settings'}" exact />
      </q-tabs>
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
  import { useLogo } from '../../composables/Logo'
  import ClusterSelection from '../clusterselection/ClusterSelection.vue'

  const logo = useLogo()
</script>
