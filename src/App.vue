<template>
  <div class="app">
    <header class="navbar" :class="'navbar--'+this.$store.state.connection">
      <div class="container">
        Elasticvue
        <connect></connect>
      </div>
    </header>
    <div class="container">
      <router-view></router-view>
    </div>
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
    width: 50%;
    margin-left: auto;
    margin-right: auto;
  }

  .navbar {
    height: 50px;
    background-color: lightgray;
  }

  .navbar--success {
    background-color: lightgreen;
  }

  .navbar--error {
    background-color: red;
  }
</style>
