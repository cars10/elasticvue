<template>
  <q-btn color="positive" icon="sync" :label="t('setup.import_predefined_clusters.heading')"
         :disable="clusters.length === 0" @click="dialog = true" />

  <q-dialog v-model="dialog" position="top" transition-show="scale" transition-hide="scale">
    <q-card style="width: 1000px;max-width: 1000px" class="q-mt-xl">
      <q-card-section class="flex justify-between">
        <h2 class="text-h5 q-my-none">{{ t('setup.import_predefined_clusters.heading') }}</h2>
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-separator class="q-mb-lg" />

      <q-table v-model:selected="selectedClusters"
               class="table-mon1o"
               flat
               dense
               row-key="name"
               selection="multiple"
               :columns="columns"
               :hide-pagination="true"
               :hide-selected-banner="true"
               :rows-per-page-options="[0]"
               :rows="clusters"
               :pagination="{sortBy: 'name'}">
        <template #body="cluster">
          <predefined-cluster-row v-model:cluster="cluster.row" v-model:selected="cluster.selected" />
        </template>

        <template #header-selection />
      </q-table>

      <q-card-section class="q-mt-lg">
        <q-btn color="positive" :disable="selectedClusters.length === 0" class="q-mr-md"
               :label="t('setup.import_predefined_clusters.import', {count:selectedClusters.length})"
               @click="submit" />

        <q-btn v-close-popup flat :label="t('defaults.cancel')" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  import { useTranslation } from '../../composables/i18n.ts'
  import PredefinedClusterRow from './PredefinedClusterRow.vue'
  import { usePredefinedClusters } from '../../composables/components/predefinedclusters/PredefinedClusters.ts'

  const t = useTranslation()

  const { clusters, columns, dialog, selectedClusters, submit } = usePredefinedClusters()
</script>