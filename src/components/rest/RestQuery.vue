<template>
  <div>
    <q-card class="q-mb-md">
      <q-card-section class="flex items-center">
        <h1 class="text-h5 q-my-none">
          {{ t('query.heading') }}
        </h1>
        <q-btn href="https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html"
               flat
               class="q-ml-md"
               icon="launch"
               :label="t('query.api_documentation')"
               target="_blank" />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-btn :label="t('query.rest.history')"
               icon="history"
               :icon-right="historyOpen ? 'expand_less' : 'expand_more'"
               color="dark-grey q-mb-sm q-mr-md"
               :outline="historyOpen"
               @click="toggleHistory" />

        <q-btn label="Saved queries"
               icon="save"
               :icon-right="savedQueriesOpen ? 'expand_less' : 'expand_more'"
               color="dark-grey q-mb-sm"
               :outline="savedQueriesOpen"
               @click="toggleSavedQueries" />

        <q-slide-transition>
          <rest-query-history v-if="historyOpen"
                              heading="History"
                              :pagination-options="{sortBy: 'date', descending: true}"
                              :data="history"
                              :columns="historyColumns"
                              @use-request="useRequest"
                              @use-request-new-tab="useRequestInNewTab">
            <template #default="{row}">
              <td>
                <div class="q-py-xs">
                  <strong :class="`http-${row.method} q-pr-sm`">{{ row.method }}</strong> {{ row.path }}
                  <div>
                    <small class="text-muted ellipsis">{{ row.body.slice(0, 100).replace(/\s/g, '') }}</small>
                  </div>
                </div>
              </td>
              <td class="small-wrap">{{ row.date.toLocaleString() }}</td>
              <td class="small-wrap">
                <q-btn icon="save" flat dense @click.stop="saveHistory(row)" />
                <q-btn icon="delete" flat dense @click.stop="removeHistory(row.id)" />
              </td>
            </template>
          </rest-query-history>
        </q-slide-transition>

        <q-slide-transition>
          <rest-query-history v-if="savedQueriesOpen"
                              heading="Saved Queries"
                              :pagination-options="{}"
                              :data="savedQueries"
                              :columns="savedQueriesColumns"
                              @use-request="useRequest"
                              @use-request-new-tab="useRequestInNewTab">
            <template #default="{row}">
              <td>
                <div class="q-py-xs">
                  <strong :class="`http-${row.method} q-pr-sm`">{{ row.method }}</strong> {{ row.path }}
                  <div>
                    <small class="text-muted ellipsis">{{ row.body.slice(0, 100).replace(/\s/g, '') }}</small>
                  </div>
                </div>
              </td>
              <td>
                {{ row.name }}
              </td>
              <td class="small-wrap">
                <q-btn-group>
                  <q-btn icon="edit" color="dark-grey" dense>
                    <q-popup-edit v-slot="scope" v-model="row.name" auto-save anchor="center right"
                                  @save="v => {renameSavedQuery(v, row)}">
                      <q-input v-model="scope.value" dense autofocu outlined @keyup.enter="scope.set" />
                    </q-popup-edit>
                  </q-btn>
                  <q-btn icon="delete" color="dark-grey" dense @click.stop="removeSavedQuery(row.id)" />
                </q-btn-group>
              </td>
            </template>
          </rest-query-history>
        </q-slide-transition>
      </q-card-section>
    </q-card>

    <q-card>
      <q-tabs v-model="activeTabName" align="left" outside-arrows>
        <template v-for="(tab, index) in tabs" :key="tab.name">
          <q-tab :name="tab.name" style="white-space: nowrap; flex-shrink: 0">
            <div class="flex">
              {{ tab.label }}

              <q-btn icon="edit" flat dense size="sm">
                <q-popup-edit v-slot="scope" v-model="tab.label" auto-save anchor="top left"
                              @save="v => {updateTab(renameSavedQuery, tab)}">
                  <q-input v-model="scope.value" dense autofocu outlined @keyup.enter="scope.set" />
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
          <rest-query-form :tab="tab" @reload-history="reloadHistory" @reload-saved-queries="reloadSavedQueries" />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </div>
</template>

<script setup>
  import { ref, toRaw } from 'vue'
  import RestQueryForm from './RestQueryForm.vue'
  import { useIdbStore } from '../../composables/Idb'
  import { useTranslation } from '../../composables/i18n'
  import { useRestQueryTabs } from '../../composables/RestQueryTabs'
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  import RestQueryHistory from './RestQueryHistory.vue'

  const t = useTranslation()
  const {
    restQueryHistory,
    restQueryTabs,
    restQuerySavedQueries
  } = useIdbStore(['restQueryHistory', 'restQueryTabs', 'restQuerySavedQueries'])

  const historyOpen = ref(false)
  const savedQueriesOpen = ref(false)
  const toggleHistory = () => {
    historyOpen.value = !historyOpen.value
    savedQueriesOpen.value = false
  }
  const toggleSavedQueries = () => {
    savedQueriesOpen.value = !savedQueriesOpen.value
    historyOpen.value = false
  }

  const history = ref([])
  const savedQueries = ref([])

  const reloadHistory = () => (restQueryHistory.getAll().then(r => (history.value = r)))
  const removeHistory = id => (restQueryHistory.remove(id).then(reloadHistory))
  reloadHistory()

  const reloadSavedQueries = () => (restQuerySavedQueries.getAll().then(r => savedQueries.value = r.reverse()))
  const removeSavedQuery = id => (restQuerySavedQueries.remove(id).then(reloadSavedQueries))
  const saveHistory = row => {
    const { method, path, body } = row
    restQuerySavedQueries.insert({ method, path, body }).then(reloadSavedQueries)
  }
  reloadSavedQueries()

  const useRequest = async request => {
    const activeTab = tabs.value[activeTabIndex()]
    if (!activeTab || !request) return

    const obj = Object.assign({}, toRaw(activeTab), { request: toRaw(request) })
    await restQueryTabs.update(obj)
    activeTab.request.method = obj.request.method
    activeTab.request.path = obj.request.path
    activeTab.request.body = obj.request.body
  }

  const useRequestInNewTab = async request => {
    await addTab()
    await useRequest(request)
  }

  const renameSavedQuery = (name, row) => {
    const obj = Object.assign({}, toRaw(row), { name })
    restQuerySavedQueries.update(obj)
  }

  const {
    tabs,
    activeTabName,
    activeTabIndex,
    reloadTabs,
    addTab,
    updateTab,
    removeTab
  } = useRestQueryTabs(restQueryTabs)
  reloadTabs()

  const historyColumns = [
    { label: t('query.rest_query_history.table.headers.query'), field: 'query', name: 'query', align: 'left' },
    {
      label: t('query.rest_query_history.table.headers.timestamp'), field: 'date', name: 'date', align: 'left',
      sortOrder: 'da', sortable: true
    },
    { label: '' },
  ]

  const savedQueriesColumns = [
    { label: t('query.rest_query_history.table.headers.query'), field: 'query', name: 'query', align: 'left' },
    { label: 'Name', field: 'name', name: 'name', align: 'left', sortable: true },
    { label: '' },
  ]

</script>
