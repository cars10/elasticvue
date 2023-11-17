<template>
  <div>
    <q-card class="q-mb-md">
      <q-card-section class="flex items-center">
        <h1 class="text-h5 q-my-none">
          {{ t('query.heading') }}
        </h1>
        <q-btn :href="`https://www.elastic.co/guide/en/elasticsearch/reference/${clusterMinor}/index.html`"
               flat
               class="q-ml-md"
               icon="launch"
               :label="t('query.api_documentation')"
               target="_blank" />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="flex justify-between">
          <div>
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
          </div>

          <rest-query-examples @use-request="useRequest" />
        </div>

        <q-slide-transition>
          <rest-query-history-list :open="historyOpen" @use-request="useRequest"
                                   @use-request-new-tab="useRequestInNewTab" />
        </q-slide-transition>

        <q-slide-transition>
          <rest-query-saved-queries-list :open="savedQueriesOpen" @use-request="useRequest"
                                         @use-request-new-tab="useRequestInNewTab" />
        </q-slide-transition>
      </q-card-section>
    </q-card>

    <rest-query-form-tabs ref="tabs" />
  </div>
</template>

<script setup lang="ts">
  import { computed, Ref, ref, toRaw } from 'vue'
  import { useIdbStore } from '../../db/Idb.ts'
  import { useTranslation } from '../../composables/i18n'
  import RestQueryExamples from './RestQueryExamples.vue'
  import RestQueryHistoryList from './RestQueryHistoryList.vue'
  import RestQuerySavedQueriesList from './RestQuerySavedQueriesList.vue'
  import RestQueryFormTabs from './RestQueryFormTabs.vue'
  import { IdbRestQueryTabRequest } from '../../db/types.ts'
  import { useConnectionStore } from '../../store/connection.ts'

  const { activeCluster } = useConnectionStore()
  const clusterMinor = computed(() => (activeCluster?.version?.split('.')?.slice(0, 2)?.join('.')))

  const t = useTranslation()
  const { restQueryTabs } = useIdbStore()

  const tabs: Ref<InstanceType<typeof RestQueryFormTabs> | null> = ref(null)
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

  const useRequest = async (request: IdbRestQueryTabRequest) => {
    if (!request || !tabs.value) return

    const activeTab = restQueryTabs.all.value[tabs.value.activeTabIndex()]
    if (!activeTab) return

    const { id, label, name } = activeTab
    const obj = Object.assign({}, { id, label, name }, {
      request: toRaw(request),
      response: { status: '', ok: false, bodyText: '' }
    })
    await restQueryTabs.update(obj)
  }

  const useRequestInNewTab = async (request: IdbRestQueryTabRequest) => {
    if (!tabs.value) return

    await tabs.value.addTab()
    await useRequest(request)
  }
</script>
