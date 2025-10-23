<template>
    
  <q-card class="search-documents-table column fit no-wrap overflow-hidden">

    <!-- SECTION EN-TÊTE FIXE -->
    <q-card-section class="row items-center no-wrap overflow-hidden">
      <h1 class="text-h5 q-my-none q-mr-md">
        {{ t('search.heading') }}
      </h1>

      <!-- Onglets -->
      <q-tabs
        v-model="activeTabName" align="left"
        outside-arrows class="col-shrink"
        shrink content-class="overflow-hidden">
        <template v-for="(tab, index) in tabs" :key="tab.name"> 
          <q-tab :name="tab.name" style="white-space: nowrap; flex-shrink: 0"> 
            <div class="flex"> {{ tab.label }} 
              <q-btn icon="edit" flat dense size="sm"> 
                <q-popup-edit v-slot="scope" v-model="tab.label" auto-save anchor="top left" @save="(v) => {updateTab(v, tab)}"> 
                  <custom-input v-model="scope.value" dense autofocu outlined @keydown.enter="scope.set" /> 
                </q-popup-edit> 
              </q-btn> 
              <q-btn icon="close" flat dense size="sm" @click.stop="removeTab(index as number)" />
            </div> 
          </q-tab> 
          <q-separator vertical /> 
        </template>
        
        <q-btn icon="add" flat style="height: 48px;" @click="addTab" />
      </q-tabs>
    </q-card-section>

    <q-separator />

    <!-- PANNEAUX EXTENSIBLES -->
    <q-tab-panels v-model="activeTabName" class="col overflow-hidden">
      <q-tab-panel
        v-for="tab in tabs"
        :key="`${tab.name}-panel`"
        :name="tab.name"
        class="q-pa-none fit overflow-auto"
      >
        <div class="search-tab-content column fit">
          <search-documents-form :tab="tab" class="col" />
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-card>

</template>

<style lang="scss">
  .search-documents-table{
    flex: 1;
    min-height: 0;
    overflow: auto;  
    display: flex;
    flex-direction: column;
  }
</style>

<script setup lang="ts">
  import SearchDocumentsForm from './SearchDocumentsForm.vue'
  import { usesearchDocumentsFormTabs } from '../../composables/components/search/SearchDocumentsTabs.ts'
  import CustomInput from '../shared/CustomInput.vue'
  import { useTranslation } from '../../composables/i18n'

  const t = useTranslation()
  const { tabs, activeTabName, addTab, updateTab, removeTab } = usesearchDocumentsFormTabs()
  defineExpose({ addTab })
</script>