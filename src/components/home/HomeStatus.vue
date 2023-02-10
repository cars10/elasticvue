<template>
  <div class="row">
    <div class="col-lg-4 offset-lg-2 offset-md-1 col-md-5 col-sm-12">
      <cluster-information class="q-ma-sm" />
    </div>

    <div class="col-lg-4 col-md-5 col-sm-12">
      <cluster-health class="q-ma-sm" />
    </div>
  </div>
</template>

<script setup>
  import ClusterInformation from './ClusterInformation.vue'
  import ClusterHealth from './ClusterHealth.vue'
</script>
