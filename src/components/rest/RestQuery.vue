<template>
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
        <rest-query-history-list :history="history"
                                  :open="historyOpen"
                                  @reload-saved-queries="reloadSavedQueries"
                                  @reload-history="reloadHistory"
                                  @use-request="useRequest"
                                  @use-request-new-tab="useRequestInNewTab" />
      </q-slide-transition>

      <q-slide-transition>
        <rest-query-saved-queries-list :saved-queries="savedQueries"
                                        :open="savedQueriesOpen"
                                        @reload-saved-queries="reloadSavedQueries"
                                        @use-request="useRequest"
                                        @use-request-new-tab="useRequestInNewTab" />
      </q-slide-transition>
    </q-card-section>
  </q-card>

  <rest-query-form-tabs ref="tabs" @reload-history="reloadHistory" @reload-saved-queries="reloadSavedQueries" />
</template>

<script setup lang="ts">
  import { useTranslation } from '../../composables/i18n'
  import { useRestQuery } from '../../composables/components/rest/RestQuery.ts'
  import RestQueryExamples from './RestQueryExamples.vue'
  import RestQueryHistoryList from './RestQueryHistoryList.vue'
  import RestQuerySavedQueriesList from './RestQuerySavedQueriesList.vue'
  import RestQueryFormTabs from './RestQueryFormTabs.vue'
  import { Ref, ref } from 'vue'

  const t = useTranslation()
  const tabs: Ref<typeof RestQueryFormTabs | null> = ref(null)

  const {
    clusterMinor,
    history,
    savedQueries,
    historyOpen,
    savedQueriesOpen,
    reloadHistory,
    reloadSavedQueries,
    toggleHistory,
    toggleSavedQueries,
    useRequest,
    useRequestInNewTab
  } = useRestQuery(tabs)
</script>
