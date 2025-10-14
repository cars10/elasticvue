<template>
  <q-card class="d-flex flex-column flex-grow-1">
    <q-card-section class="flex items-center">
      <h1 class="text-h5 q-my-none q-mr-md">
        {{ t('search.heading') }}
      </h1>
      <q-tabs v-model="activeTabName" align="left" outside-arrows>
        <template v-for="(tab, index) in tabs" :key="tab.name">
          <q-tab :name="tab.name" style="white-space: nowrap; flex-shrink: 0">
            <div class="flex">
              {{ tab.label }}

              <q-btn icon="edit" flat dense size="sm">
                <q-popup-edit v-slot="scope" v-model="tab.label" auto-save anchor="top left"
                              @save="(v) => {updateTab(v, tab)}">
                  <custom-input v-model="scope.value" dense autofocu outlined @keydown.enter="scope.set" />
                </q-popup-edit>
              </q-btn>

              <q-btn icon="close" flat dense size="sm" @click.stop="removeTab(index as number)" />
            </div>
          </q-tab>
          <q-separator vertical />
        </template>
        <q-btn icon="add" flat style="height:48px;" @click="addTab" />
      </q-tabs>
    </q-card-section>

    <q-separator />

    <q-tab-panels v-model="activeTabName" class="flex-grow-1">
      <q-tab-panel v-for="tab in tabs" :key="`${tab.name}-panel`" :name="tab.name" class="q-pa-none h-100">
        <div class="h-100 d-flex flex-column">
          <search-documents-form :tab="tab" />
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-card>
</template>

<script setup lang="ts">
  import SearchDocumentsForm from './SearchDocumentsForm.vue'
  import { usesearchDocumentsFormTabs } from '../../composables/components/search/SearchDocumentsTabs.ts'
  import CustomInput from '../shared/CustomInput.vue'
  import { useTranslation } from '../../composables/i18n'

  const t = useTranslation()
  const { tabs, activeTabName, addTab, updateTab, removeTab } = usesearchDocumentsFormTabs()
  defineExpose({ addTab })
</script>