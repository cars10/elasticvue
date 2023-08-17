<template>
  <q-card data-testid="cluster-health">
    <q-card-section>
      <h2 class="text-h5 q-my-none">{{ t('home.cluster_health.heading') }}</h2>
    </q-card-section>

    <q-card-section class="font-14 q-px-none">
      <loader-status :request-state="requestState">
        <q-list v-if="data" dense>
          <q-item>
            <q-item-section>
              <q-item-label>Status</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label :class="`health--${data.status}`">{{ data.status }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label>Timed out</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label :class="{'health--yellow': data.timed_out}">{{ data.timed_out }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label>Relocating shards</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label :class="{'health--yellow': data.relocating_shards > 0}">
                {{ data.relocating_shards }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label>Initializing shards</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label :class="{'health--yellow': data.initializing_shards > 0}">
                {{ data.initializing_shards }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label>Unassigned shards</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label :class="{'health--yellow': data.unassigned_shards > 0}">
                {{ data.unassigned_shards }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label>Delayed unassigned shards</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label :class="{'health--yellow': data.delayed_unassigned_shards > 0}">
                {{ data.delayed_unassigned_shards }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label>Active shards</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label :title="data.active_shards">
                {{ data.active_shards }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-if="data.active_shards_percent_as_number">
            <q-item-section>
              <q-item-label>Active shards percent</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label :title="data.active_shards_percent_as_number"
                            :class="{'health--yellow': data.active_shards_percent_as_number < 100}">
                {{ data.active_shards_percent_as_number.toFixed(2) }}%
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label>Pending tasks</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ data.number_of_pending_tasks }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label>In flight fetch</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ data.number_of_in_flight_fetch }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item v-if="data.task_max_waiting_in_queue_millis">
            <q-item-section>
              <q-item-label>Task max waiting in queue</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label>{{ data.task_max_waiting_in_queue_millis }}</q-item-label>
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

  type ClusterHealth = {
    cluster_name: string
    status: string
    timed_out: string
    number_of_nodes: number
    number_of_data_nodes: number
    active_primary_shards: number
    active_shards: number
    relocating_shards: number
    initializing_shards: number
    unassigned_shards: number
    delayed_unassigned_shards: number
    number_of_pending_tasks: number
    number_of_in_flight_fetch: number
    task_max_waiting_in_queue_millis?: number
    active_shards_percent_as_number?: number
  }

  const { requestState, data, load } = useElasticsearchRequest<ClusterHealth>('clusterHealth')
  onMounted(load)
</script>
