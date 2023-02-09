<template>
  <q-card>
    <q-card-section class="flex items-center">
      <h1 class="text-h5 q-my-none">
        {{ $t('home.client_information.heading') }}
      </h1>
      <reload-button :action="load" />
    </q-card-section>

    <q-separator />

    <q-card-section class="fontsize-14">
      <loader-status :request-state="requestState">
        <q-list v-if="data && data['version']" dense>
          <q-item>
            <q-item-section>
              <q-item-label>name</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ data['name'] }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label>cluster_name</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ data['cluster_name'] }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label>cluster_uuid</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ data['cluster_uuid'] }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label>tagline</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ data['tagline'] }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label>version.number</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ data['version']['number'] }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label>version.build_flavor</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ data['version']['build_flavor'] }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label>version.build_type</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ data['version']['build_type'] }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label>version.build_hash</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ data['version']['build_hash'] }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label>version.build_date</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ data['version']['build_date'] }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label>version.build_snapshot</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ data['version']['build_snapshot'] }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label>version.lucene_version</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ data['version']['lucene_version'] }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label>version.minimum_wire_compatibility_version</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>
                {{ data['version']['minimum_wire_compatibility_version'] }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label>version.minimum_index_compatibility_version</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>
                {{ data['version']['minimum_index_compatibility_version'] }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </loader-status>
    </q-card-section>
  </q-card>
</template>

<script setup>
  import { onMounted } from 'vue'
  import { useTranslation } from '../../composables/i18n'
  import LoaderStatus from '../shared/LoaderStatus.vue'
  import { useElasticsearchRequest } from '../../composables/CallElasticsearch'
  import ReloadButton from '../shared/ReloadButton.vue'

  const t = useTranslation()

  const { requestState, data, load } = useElasticsearchRequest('clusterInfo')
  onMounted(load)
</script>