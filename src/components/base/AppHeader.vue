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

      <q-btn stretch flat label="Home" :to="{name: 'home'}" />
      <q-btn stretch flat label="Nodes" :to="{name: 'nodes'}" />
      <q-btn stretch flat label="Shards" :to="{name: 'shards'}" />
      <q-btn stretch flat label="Indices" :to="{name: 'indices'}" />
      <q-btn stretch flat label="Search" />
      <q-btn stretch flat label="Rest" :to="{name: 'rest'}" />
      <q-btn stretch flat label="Snapshots" />
      <q-btn stretch flat label="Utilities" />
      <q-btn stretch flat icon="settings" :to="{name: 'settings'}" />
    </q-toolbar>
  </q-header>
</template>

<script setup>
  import { useLogo } from '../../composables/Logo'
  import { useConnectionStore } from '../../store/connection'

  const connectionStore = useConnectionStore()
  const logo = useLogo()
</script>
