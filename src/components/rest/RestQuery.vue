<template>
  <div>
    <q-card class="q-mb-md">
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
        <rest-query-history @use-request="useRequest" />
      </q-card-section>
    </q-card>

    <q-card>
      <q-tabs v-model="activeTab" align="left">
        <q-tab v-for="tab in db.stores.restQueryTabs.elements.value" :key="tab.name" :name="tab.name">
          <div class="flex">
            {{ tab.label }}

            <q-btn icon="edit" flat dense size="sm" class="q-ml-sm">
              <q-popup-edit v-slot="scope" v-model="tab.label" auto-save anchor="top left"
                            @save="value => {updateTab(value, tab)}">
                <q-input v-model="scope.value" dense autofocu @keyup.enter="scope.set" />
              </q-popup-edit>
            </q-btn>

            <q-btn icon="close" flat dense size="sm" @click="removeTab(tab.id)" />
          </div>
        </q-tab>
        <q-btn icon="add" flat style="height:48px;" @click="addTab" />
      </q-tabs>

      <q-separator />

      <q-card-section>
        <q-tab-panels v-model="activeTab">
          <q-tab-panel v-for="tab in db.stores.restQueryTabs.elements.value" :key="`${tab.name}-panel`"
                       :name="tab.name">
            <rest-query-form :tab="tab" />
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
  import { ref, toRaw } from 'vue'
  import RestQueryForm from './RestQueryForm.vue'
  import RestQueryHistory from './RestQueryHistory.vue'
  import { buildDefaultRequest } from '../../consts'
  import { useIdb } from '../../composables/Idb'

  const db = useIdb()
  const tabs = db.stores.restQueryTabs.elements
  const activeTab = ref(null)

  const useRequest = request => {
    const tab = tabs.value.find(t => t.name === activeTab.value)
    db.stores.restQueryTabs.update(Object.assign({}, toRaw(tab), { request: toRaw(request) }))
  }

  const generateTab = () => {
    return {
      name: `tab-${Date.now()}`,
      label: `Tab ${tabs.value.length + 1}`,
      request: buildDefaultRequest()
    }
  }

  const reloadTabs = async () => {
    await db.stores.restQueryTabs.reload()

    if (tabs.value.length === 0) await addTab()
    if (activeTab.value || tabs.value.length === 0) return
    activeTab.value = tabs.value[0].name
  }
  reloadTabs()

  const addTab = () => {
    db.stores.restQueryTabs.insert(generateTab()).then(() => {
      activeTab.value = tabs.value[tabs.value.length - 1].name
    })
  }
  const updateTab = (label, tab) => {
    db.stores.restQueryTabs.update(Object.assign({}, toRaw(tab), { label }))
  }
  const removeTab = async id => {
    const oldTab = activeTab.value
    await db.stores.restQueryTabs.remove(id)
    activeTab.value = oldTab
  }
</script>
