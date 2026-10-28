<template>
  <div class="flex justify-between items-center q-mb-lg">
    <h1 class="page-title">{{ t('query.heading') }}</h1>

    <div class="flex items-center q-gutter-sm">
      <q-btn flat no-caps icon="launch" :href="docsUrl" target="_blank" :label="t('query.api_documentation')" />
      <q-btn
        color="dark-grey"
        no-caps
        icon="manage_history"
        :label="t('query.library.title')"
        data-testid="rest-library-open"
        @click="libraryOpen = true"
      />
    </div>
  </div>

  <rest-query-library v-model="libraryOpen" />
  <rest-query-form-tabs v-if="restStore.loaded" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTranslation } from '../../composables/i18n'
import { useConnectionStore } from '../../store/connection.ts'
import { useRestStore } from '../../store/rest.ts'
import { restDocsUrl } from '../../helpers/rest.ts'
import RestQueryLibrary from './RestQueryLibrary.vue'
import RestQueryFormTabs from './RestQueryFormTabs.vue'

const t = useTranslation()
const connectionStore = useConnectionStore()
const restStore = useRestStore()
const libraryOpen = ref(false)

const docsUrl = computed(() => restDocsUrl(connectionStore.elasticsearch, connectionStore.activeCluster?.version))

restStore.load()
</script>
