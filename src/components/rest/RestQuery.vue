<template>
  <q-card>
    <q-card-section class="flex items-center">
      <h1 class="text-h5 q-my-none">
        {{ $t('query.heading') }}
      </h1>
      <q-btn href="https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html"
             size="sm"
             class="q-ml-md"
             icon="launch"
             :label="$t('query.api_documentation')"
             target="_blank" />
    </q-card-section>

    <q-separator />

    <q-card-section>
      <rest-query-history />
    </q-card-section>

    <q-card-section>
      <q-tabs v-model="restQueryStore.activeTab" align="left" class="bg-darken">
        <q-tab v-for="(tab, index) in restQueryStore.tabs" :key="tab.name" :name="tab.name">
          <div class="flex">
            {{ tab.label }}

            <q-btn icon="edit" flat dense size="sm" class="q-ml-sm">
              <q-popup-edit v-slot="scope" v-model="tab.label" auto-save anchor="top left">
                <q-input v-model="scope.value" dense autofocu @keyup.enter="scope.set" />
              </q-popup-edit>
            </q-btn>

            <q-btn icon="close" flat dense size="sm" @click="restQueryStore.removeTab(index)" />
          </div>
        </q-tab>
        <q-btn icon="add" flat style="height:48px;" @click="restQueryStore.addTab()" />
      </q-tabs>

      <q-tab-panels v-model="restQueryStore.activeTab">
        <q-tab-panel v-for="tab in restQueryStore.tabs" :key="`${tab.name}-panel`" :name="tab.name">
          <rest-query-form :request="tab.request" />
        </q-tab-panel>
      </q-tab-panels>
    </q-card-section>
  </q-card>
</template>

<script setup>
  import RestQueryForm from './RestQueryForm.vue'
  import RestQueryHistory from './RestQueryHistory.vue'
  import { useRestQueryStore } from '../../store/rest_query'

  const restQueryStore = useRestQueryStore()
</script>
