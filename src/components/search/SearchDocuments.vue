<template>
  <q-card class="search-documents">
      <search-documents-form-tabs ref="tabs"/>
  </q-card>   
</template>

<script setup lang="ts">
  import SearchDocumentsFormTabs from './SearchDocumentsFormTabs.vue'
  import { Ref, ref } from 'vue'
  
  const tabs: Ref<typeof SearchDocumentsFormTabs | null> = ref(null)

</script>

<style lang="scss">
  .search-documents {
    flex: 1;
    min-height: 0;
    overflow: auto;  
    display: flex;
    flex-direction: column;
  }
</style>