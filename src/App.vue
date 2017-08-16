<template>
  <div class="app">
    <md-toolbar>
      <md-layout>
        <md-layout md-align="start" md-vertical-align="center">
          <router-link class="md-title" to="/">Elasticvue</router-link>
          &nbsp;&nbsp;<md-chip :class="'md-'+this.$store.state.connection">{{this.$store.state.connection}}</md-chip>
        </md-layout>

        <md-layout md-align="center" md-vertical-align="center">
          <connect></connect>
        </md-layout>

        <md-layout md-align="end">
          <router-link to="/" class="md-button">Home</router-link>
          <router-link to="/browse" class="md-button">Browse</router-link>
          <router-link to="/search" class="md-button">Search</router-link>
        </md-layout>
      </md-layout>
    </md-toolbar>
    <main class="container">
      <md-layout class="p1">
        <router-view></router-view>
      </md-layout>
    </main>
  </div>
</template>

<script>
  import Connect from '@/components/Connect'

  export default {
    components: {
      Connect
    }
  }
</script>
