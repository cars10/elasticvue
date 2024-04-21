<template>
  <q-card data-testid="cluster-information">
    <q-card-section>
      <h2 class="text-h5 q-my-none">{{ t('home.client_information.heading') }}</h2>
    </q-card-section>

    <q-card-section class="font-14 q-px-none">
      <loader-status :request-state="requestState">
        <q-list v-if="data && data.version" dense>
          <q-item>
            <q-item-section>
              <q-item-label>Node Name</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ data.name }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label>Cluster name</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ data.cluster_name }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-if="data.cluster_uuid">
            <q-item-section>
              <q-item-label>Cluster uuid</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ data.cluster_uuid }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label>Tagline</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ data.tagline }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item-label header class="q-mt-sm">Version</q-item-label>

          <q-item v-if="data.version.distribution">
            <q-item-section>
              <q-item-label>Distribution</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ data.version.distribution }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label>Number</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ data.version.number }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-if="data.version.build_flavor">
            <q-item-section>
              <q-item-label>Build flavor</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ data.version.build_flavor }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-if="data.version.build_type">
            <q-item-section>
              <q-item-label>Build type</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ data.version.build_type }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-if="data.version.build_hash">
            <q-item-section>
              <q-item-label>Build hash</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ data.version.build_hash }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-if="data.version.build_date">
            <q-item-section>
              <q-item-label>Build date</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ data.version.build_date }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-if="data.version.build_snapshot">
            <q-item-section>
              <q-item-label>Build snapshot</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ data.version.build_snapshot }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-if="data.version.lucene_version">
            <q-item-section>
              <q-item-label>Lucene version</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ data.version.lucene_version }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-if="data.version.minimum_wire_compatibility_version">
            <q-item-section>
              <q-item-label>Minimum wire compatibility version</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ data.version.minimum_wire_compatibility_version }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-if="data.version.minimum_index_compatibility_version">
            <q-item-section>
              <q-item-label>Minimum index compatibility version</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ data.version.minimum_index_compatibility_version }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </loader-status>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import LoaderStatus from '../shared/LoaderStatus.vue'
  import { useElasticsearchRequest } from '../../composables/CallElasticsearch'
  import { useTranslation } from '../../composables/i18n.ts'

  const t = useTranslation()

  type ClusterInformation = {
    name: string
    cluster_name: string
    cluster_uuid: string
    version: {
      distribution?: string
      number: string
      build_flavor: string
      build_type: string
      build_hash: string
      build_date: string
      build_snapshot: string
      lucene_version: string
      minimum_wire_compatibility_version: string
      minimum_index_compatibility_version: string
    }
    tagline: string
  }

  const { requestState, data, load } = useElasticsearchRequest<ClusterInformation>('clusterInfo')
  onMounted(load)
</script>