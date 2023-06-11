<template>
  <div class="row q-pt-sm">
    <div class="col-lg-8 offset-lg-2">
      <div class="row q-col-gutter-lg">
        <div class="col-3">
          <q-card v-if="data" class="full-height" data-testid="cluster-status">
            <q-card-section>
              <h3 class="text-h6 q-my-none">{{ data.cluster_name }}</h3>
              <span class="text-muted font-13">{{ data.cluster_uuid }}</span>
            </q-card-section>
            <q-card-section class="items-center justify-between flex">
              <div :class="`text-h6 inline-block health--${data.status}`">
                <q-icon :name="data.status === 'green' ? 'check' : 'warning'" size="sm" class="q-mr-sm" />
                {{ data.status }}
              </div>

              <unhealthy-reason v-if="data.status !== 'green'" :health="data.status" />
            </q-card-section>
          </q-card>
        </div>

        <div class="col-3">
          <q-card v-if="data" class="full-height" data-testid="cluster-nodes">
            <q-card-section style="position: initial">
              <h3 class="text-h6 q-my-none">
                <router-link :to="{name: 'nodes'}" class="decoration-none stretched">
                  <span class="text-h3">{{ data.nodes.count.total }}</span> nodes
                </router-link>
              </h3>
            </q-card-section>
            <q-card-section class="text-muted">
              <p class="q-mb-sm">{{ data.nodes.count.master }} master</p>
              <p class="q-mb-none">{{ data.nodes.count.data }} data</p>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-3">
          <q-card v-if="data" class="full-height" data-testid="cluster-shards">
            <q-card-section style="position: initial">
              <h3 class="text-h6 q-my-none">
                <router-link :to="{name: 'shards'}" class="decoration-none stretched">
                  <span class="text-h3">{{ data.indices.shards.total }}</span> shards
                </router-link>
              </h3>
            </q-card-section>
            <q-card-section class="text-muted">
              <p class="q-mb-sm">{{ data.indices.shards.primaries }} primaries</p>
              <p class="q-mb-none">{{ data.indices.shards.total - data.indices.shards.primaries }} replicas</p>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-3">
          <q-card v-if="data" class="full-height" data-testid="cluster-indices">
            <q-card-section style="position: initial">
              <h3 class="text-h6 q-my-none">
                <router-link :to="{name: 'indices'}" class="decoration-none stretched">
                  <span class="text-h3">{{ data.indices.count }}</span> indices
                </router-link>
              </h3>
            </q-card-section>
            <q-card-section class="text-muted">
              <p class="q-mb-sm">{{ data.indices.docs.count }} docs</p>
              <p class="q-mb-none">{{ prettyBytes(data.indices.store.size_in_bytes) }} on disk</p>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-6">
          <ClusterInformation />
        </div>

        <div class="col-6">
          <ClusterHealth />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useElasticsearchRequest } from '../../composables/CallElasticsearch'
  import { onMounted } from 'vue'
  import prettyBytes from 'pretty-bytes'
  import ClusterHealth from './ClusterHealth.vue'
  import ClusterInformation from './ClusterInformation.vue'
  import UnhealthyReason from './UnhealthyReason.vue'

  const { load, data } = useElasticsearchRequest<any>('clusterStats')
  onMounted(() => {
    load()
    setInterval(load, 5000)
  })
</script>
