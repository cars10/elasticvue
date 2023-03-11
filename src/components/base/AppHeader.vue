<template>
  <q-header class="bg-darken">
    <q-toolbar style="height: 64px">
      <img :src="logo" alt="logo" height="48" width="48">
      <q-toolbar-title>
        <router-link :to="{name: 'home', params: {instanceId: 1}}">
          Elasticvue
        </router-link>

        {{ connectionStore.activeCluster?.name }}
      </q-toolbar-title>

      <q-space />

      <q-tabs stretch>
        <q-route-tab class="full-height" label="Home" :to="{name: 'home'}" exact />
        <q-route-tab label="Nodes" :to="{name: 'nodes'}" exact />
        <q-route-tab label="Shards" :to="{name: 'shards'}" exact />
        <q-route-tab label="Indices" :to="{name: 'indices'}" exact />
        <q-route-tab label="Search" :to="{name: 'home'}" exact />
        <q-route-tab label="Rest" :to="{name: 'rest'}" exact />
        <q-route-tab label="Snapshots" :to="{name: 'home'}" exact />
        <q-route-tab label="Utilities" :to="{name: 'home'}" exact />
        <q-route-tab icon="settings" :to="{name: 'settings'}" exact />
      </q-tabs>
    </q-toolbar>
  </q-header>
</template>

<script setup>
  import { useLogo } from '../../composables/Logo'
  import { useConnectionStore } from '../../store/connection'

  const connectionStore = useConnectionStore()
  const logo = useLogo()
</script>
