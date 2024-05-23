<template>
  <div class="row q-pt-sm">
    <div class="col-lg-8 offset-lg-2">
      <div class="row q-col-gutter-lg">
        <div class="col-3">
          <q-card v-if="data" class="full-height" data-testid="cluster-status">
            <q-card-section>
              <h3 class="text-h6 q-my-none ellipsis" :title="data.cluster_name"> {{ data.cluster_name }}</h3>
              <span class="text-muted font-13 word-break-all">{{ connectionStore.activeCluster?.uuid }}</span>
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
              <p v-if="data.nodes.count.master" class="q-mb-sm">{{ data.nodes.count.master }} master</p>
              <p v-if="data.nodes.count.data" class="q-mb-none">{{ data.nodes.count.data }} data</p>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-3">
          <q-card v-if="data" class="full-height" data-testid="cluster-shards">
            <q-card-section style="position: initial">
              <h3 class="text-h6 q-my-none">
                <router-link :to="{name: 'shards'}" class="decoration-none stretched">
                  <span class="text-h3">{{ data.indices?.shards?.total || 0 }}</span> shards
                </router-link>
              </h3>
            </q-card-section>
            <q-card-section class="text-muted">
              <p class="q-mb-sm">{{ data.indices.shards?.primaries || 0 }} primaries</p>
              <p class="q-mb-none">
                {{ (data.indices?.shards?.total || 0) - (data.indices.shards?.primaries || 0) }} replicas
              </p>
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
  import { onMounted, onUnmounted } from 'vue'
  import prettyBytes from 'pretty-bytes'
  import ClusterHealth from './ClusterHealth.vue'
  import ClusterInformation from './ClusterInformation.vue'
  import UnhealthyReason from './UnhealthyReason.vue'
  import { useConnectionStore } from '../../store/connection.ts'

  const connectionStore = useConnectionStore()

  type ClusterStats = {
    cluster_name: string
    cluster_uuid: string
    status: string
    nodes: {
      count: {
        total: number
        master: number
        data: number
      }
    }
    indices: {
      count: number
      shards: {
        total: number
        primaries: number
      }
      docs: {
        count: number
      }
      store: {
        size_in_bytes: number
      }
    }
  }

  const { load, data } = useElasticsearchRequest<ClusterStats>('clusterStats')
  let interval: number
  onMounted(() => {
    load()
    interval = setInterval(load, 10000)
  })
  onUnmounted(() => (clearInterval(interval)))
</script>
