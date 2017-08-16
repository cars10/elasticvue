<template>
  <div class="app">
    <md-toolbar>
      <md-layout>
        <md-layout md-align="start">
          <router-link class="md-title" to="/">Elasticvue</router-link>
        </md-layout>

        <md-layout md-align="center" md-vertical-align="center">
          <connect></connect>
        </md-layout>

        <md-layout md-align="end">
          <md-button @click.native="$router.push({ name: 'Home'})">Home</md-button>
          <md-button @click.native="$router.push({ name: 'Browse'})">Browse</md-button>
          <md-button @click.native="$router.push({ name: 'Search'})">Search</md-button>
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

<style>
  .app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
  }

  .container {
    width: 80%;
    margin-left: auto;
    margin-right: auto;
  }

  a.md-title {
    color: #fff !important;
    text-decoration: none !important;
  }
</style>
