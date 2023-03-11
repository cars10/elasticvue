<template>
  <div>
    <q-card class="q-mb-md">
      <q-card-section class="flex items-center">
        <h1 class="text-h5 q-my-none">
          {{ $t('query.heading') }}
        </h1>
        <q-btn href="https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html"
               flat
               class="q-ml-md"
               icon="launch"
               :label="$t('query.api_documentation')"
               target="_blank" />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <rest-query-history :rest-query-history="history" @use-request="useRequest" />
      </q-card-section>
    </q-card>

    <q-card>
      <q-tabs v-model="activeTabName" align="left">
        <template v-for="(tab, index) in tabs" :key="tab.name">
          <q-tab :name="tab.name">
            <div class="flex">
              {{ tab.label }}

              <q-btn icon="edit" flat dense size="sm" class="q-ml-sm">
                <q-popup-edit v-slot="scope" v-model="tab.label" auto-save anchor="top left"
                              @save="value => {updateTab(value, tab)}">
                  <q-input v-model="scope.value" dense autofocu @keyup.enter="scope.set" />
                </q-popup-edit>
              </q-btn>

              <q-btn icon="close" flat dense size="sm" @click.stop="removeTab(index)" />
            </div>
          </q-tab>
          <q-separator vertical />
        </template>
        <q-btn icon="add" flat style="height:48px;" @click="addTab" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="activeTabName">
        <q-tab-panel v-for="tab in tabs" :key="`${tab.name}-panel`" :name="tab.name">
          <rest-query-form :tab="tab" @reload-history="reloadHistory" />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </div>
</template>

<script setup>
  import { ref, toRaw } from 'vue'
  import RestQueryForm from './RestQueryForm.vue'
  import RestQueryHistory from './RestQueryHistory.vue'
  import { buildDefaultRequest } from '../../consts'
  import { useIdbStore } from '../../composables/Idb'

  const history = ref([])
  const tabs = ref([])
  const activeTabName = ref(null)
  const { restQueryHistory, restQueryTabs } = useIdbStore(['restQueryHistory', 'restQueryTabs'])

  const reloadTabs = async () => {
    tabs.value = await restQueryTabs.getAll()
    if (!activeTabName.value && tabs.value[0]) activeTabName.value = tabs.value[0].name
  }
  reloadTabs()
  const reloadHistory = () => (restQueryHistory.getAll().then(r => (history.value = r)))
  reloadHistory()

  const useRequest = async request => {
    const obj = Object.assign({}, toRaw(tabs.value[activeTabIndex()]), { request: toRaw(request) })
    await restQueryTabs.update(obj)
    Object.assign(tabs.value[activeTabIndex()].request, obj.request)
  }

  const activeTabIndex = () => (tabs.value.findIndex(t => t.name === activeTabName.value) || 0)

  const addTab = async () => {
    const newTab = { name: `tab-${Date.now()}`, label: `Tab ${tabs.value.length + 1}`, request: buildDefaultRequest() }
    await restQueryTabs.insert(newTab)
    await reloadTabs()
    activeTabName.value = tabs.value[tabs.value.length - 1].name
  }

  const updateTab = (label, tab) => {
    restQueryTabs.update(Object.assign({}, toRaw(tab), { label }))
  }

  const removeTab = async index => {
    await restQueryTabs.remove(tabs.value[index].id)
    if (tabs.value[index].name === activeTabName.value && tabs.value[0]) activeTabName.value = tabs.value[0].name
    tabs.value.splice(index, 1)
  }
</script>
