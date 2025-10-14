<template>
  <div class="h-100 d-flex flex-column">
    <search-documents-form-tabs ref="tabs" class="flex-grow-1"/>
  </div>
</template>

<script setup lang="ts">
  import SearchDocumentsFormTabs from './SearchDocumentsFormTabs.vue'
  import { Ref, ref } from 'vue'
  
  const tabs: Ref<typeof SearchDocumentsFormTabs | null> = ref(null)

</script>