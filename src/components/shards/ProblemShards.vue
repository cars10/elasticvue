<template>
  <q-card data-testid="problem-shards">
    <q-card-section class="row items-center justify-between">
      <div class="text-weight-medium flex items-center">
        <q-icon name="warning" size="18px" class="q-mr-sm" :class="hasCritical ? 'health--red' : 'health--yellow'" />
        {{ t('shards.problems.title', { count: shards.length }) }}
      </div>
      <router-link :to="{ name: 'tools', params: { clusterIndex }, query: { tool: 'explain' } }" class="font-13">
        {{ t('shards.problems.explain') }}
      </router-link>
    </q-card-section>

    <q-markup-table flat dense wrap-cells class="table-mono">
      <thead>
        <tr>
          <th class="text-left">{{ t('shards.problems.index') }}</th>
          <th class="text-left">{{ t('shards.problems.shard') }}</th>
          <th class="text-left">{{ t('shards.problems.state') }}</th>
          <th class="text-left">{{ t('shards.problems.node') }}</th>
          <th class="text-left">{{ t('shards.problems.reason') }}</th>
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
        {{ expanded ? t('shards.problems.show_less') : t('shards.problems.show_all', { count: shards.length }) }}
      </q-btn>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { EsShard, relocationTarget, shardNodeName, shardSeverity } from '../../helpers/shards.ts'
import { useConnectionStore } from '../../store/connection.ts'
import { useTranslation } from '../../composables/i18n.ts'

const props = defineProps<{ shards: EsShard[] }>()

const t = useTranslation()
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
