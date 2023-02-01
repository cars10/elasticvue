<template>
  <div class="row">
    <div class="col-lg-4 offset-lg-2 offset-md-1 q-ma-sm">
      <cluster-information />
    </div>

    <div class="col-lg-4 q-ma-sm">
      <cluster-health />
    </div>
  </div>
</template>

<script setup>
  import ClusterInformation from './ClusterInformation.vue'
  import ClusterHealth from './ClusterHealth.vue'
</script>
