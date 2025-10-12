<template>
  <q-card class="q-mb-md">
    <q-card-section class="flex items-center">
      <h1 class="text-h5 q-my-none">
        {{ t('search.heading') }}
      </h1>      
    </q-card-section>
    <q-separator />
  </q-card> 
  
  <search-documents-form-tabs ref="tabs"/>
</template>

<script setup lang="ts">
  import { useTranslation } from '../../composables/i18n'
  import SearchDocumentsFormTabs from './SearchDocumentsFormTabs.vue'
  import { Ref, ref } from 'vue'
  
  const t = useTranslation()
  const tabs: Ref<typeof SearchDocumentsFormTabs | null> = ref(null)

</script>