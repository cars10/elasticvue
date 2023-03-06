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
      <q-tabs v-model="activeTab" align="left" class="bg-darken">
        <q-tab v-for="tab in restQueryTabs.elements.value" :key="tab.name" :name="tab.name">
          <div class="flex">
            {{ tab.label }}

            <q-btn icon="edit" flat dense size="sm" class="q-ml-sm">
              <q-popup-edit v-slot="scope" v-model="tab.label" auto-save anchor="top left"
                            @save="(value, initialValue) => {updateTab(value, initialValue, tab)}">
                <q-input v-model="scope.value" dense autofocu @keyup.enter="scope.set" />
              </q-popup-edit>
            </q-btn>

            <q-btn icon="close" flat dense size="sm" @click="removeTab(tab.id)" />
          </div>
        </q-tab>
        <q-btn icon="add" flat style="height:48px;" @click="addTab" />
      </q-tabs>

      <q-tab-panels v-model="activeTab">
        <q-tab-panel v-for="tab in restQueryTabs.elements.value" :key="`${tab.name}-panel`" :name="tab.name">
          <rest-query-form :tab="tab" />
        </q-tab-panel>
      </q-tab-panels>
    </q-card-section>
  </q-card>
</template>

<script setup>
  import { ref, watch } from 'vue'
  import RestQueryForm from './RestQueryForm.vue'
  import RestQueryHistory from './RestQueryHistory.vue'
  import { useIdb } from '../../composables/Idb'
  import { buildDefaultRequest } from '../../consts'

  const { restQueryTabs } = useIdb()
  const activeTab = ref(restQueryTabs.elements[0]?.name)

  // TODO onmounted or whatever
  watch(restQueryTabs.elements, value => {
    console.log(restQueryTabs.elements[0])
    if (!activeTab.value) activeTab.value = value[0].name
  })

  const generateTab = length => {
    const id = Date.now()
    const num = length + 1
    const name = `tab-${id}`
    return {
      name,
      label: `Tab ${num}`,
      request: buildDefaultRequest()
    }
  }
  const addTab = () => {
    restQueryTabs.insert(generateTab(restQueryTabs.elements.value.length))
  }
  const removeTab = id => {
    const oldActiveTab = activeTab.value
    restQueryTabs.remove(id).then(() => {
      activeTab.value = oldActiveTab
    })
  }
  const updateTab = (value, initialValue, tab) => {
    const obj = JSON.parse(JSON.stringify(tab))
    restQueryTabs.update(Object.assign({}, obj, { label: value }))
  }
</script>
