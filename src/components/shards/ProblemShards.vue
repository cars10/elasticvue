<template>
  <q-card data-testid="problem-shards">
    <q-card-section class="row items-center justify-between">
      <div class="text-weight-bold flex items-center">
        <q-icon name="warning" size="22px" class="q-mr-sm" :class="hasCritical ? 'health--red' : 'health--yellow'" />
        Needs attention ({{ shards.length }})
      </div>
      <router-link :to="{ name: 'tools', params: { clusterIndex } }" class="font-13">Explain in Tools</router-link>
    </q-card-section>

    <q-markup-table flat dense wrap-cells class="table-mono">
      <thead>
        <tr>
          <th class="text-left">Index</th>
          <th class="text-left">Shard</th>
          <th class="text-left">State</th>
          <th class="text-left">Node</th>
          <th class="text-left">Reason</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="shard in visible" :key="`${shard.index}-${shard.shard}-${shard.prirep}-${shard.node}`">
          <td>{{ shard.index }}</td>
          <td>{{ shard.prirep }}{{ shard.shard }}</td>
          <td :class="stateClass(shard)">{{ shard.state }}</td>
          <td>
            <template v-if="relocationTarget(shard)"> {{ shardNodeName(shard) }} → {{ relocationTarget(shard) }} </template>
            <template v-else>{{ shard.node || '—' }}</template>
          </td>
          <td class="text-muted">{{ shard['unassigned.reason'] || '—' }}</td>
        </tr>
      </tbody>
    </q-markup-table>

    <q-card-section v-if="shards.length > limit" class="text-center">
      <q-btn flat dense no-caps color="primary" @click="expanded = !expanded">
        {{ expanded ? 'Show less' : `Show all ${shards.length}` }}
      </q-btn>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { EsShard, relocationTarget, shardNodeName, shardSeverity } from '../../helpers/shards.ts'
import { useConnectionStore } from '../../store/connection.ts'

const props = defineProps<{ shards: EsShard[] }>()

const limit = 10
const expanded = ref(false)
const clusterIndex = useConnectionStore().activeClusterIndex

const visible = computed(() => (expanded.value ? props.shards : props.shards.slice(0, limit)))
const hasCritical = computed(() => props.shards.some((shard) => shardSeverity(shard) === 'critical'))

const stateClass = (shard: EsShard) => {
  const severity = shardSeverity(shard)
  if (severity === 'critical') return 'health--red'
  if (severity === 'warning' || severity === 'moving') return 'health--yellow'
  return undefined
}
</script>
