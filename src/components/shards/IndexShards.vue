<template>
  <q-card>
    <q-card-section class="flex items-center">
      <h1 class="text-h5 q-my-none">
        {{ t('shards.heading') }}
      </h1>
      <reload-button :action="load" />
    </q-card-section>

    <q-separator />

    <loader-status :request-state="requestState">
      <shards-table :shards="shards" @reload="load">
        <q-select
          v-model="health"
          :options="['green', 'yellow', 'red']"
          :label="t('shards.health')"
          clearable
          dense
          outlined
          class="q-mr-md"
          style="min-width: 140px"
        />
      </shards-table>
    </loader-status>
  </q-card>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref, watch } from 'vue'
import ReloadButton from '../shared/ReloadButton.vue'
import LoaderStatus from '../shared/LoaderStatus.vue'
import { useElasticsearchAdapter } from '../../composables/CallElasticsearch'
import { convertShards, EsShardIndex, EsShard, TableShards } from '../../helpers/shards'
import ShardsTable from './ShardsTable.vue'
import { useTranslation } from '../../composables/i18n'
import { EsNode } from '../../types/types.ts'

const t = useTranslation()
const shards: Ref<TableShards> = ref({} as TableShards)

const { requestState, callElasticsearch } = useElasticsearchAdapter()
const health = ref(null)

type CatIndicesParams = {
  h: string[]
  s: string[]
  health?: string
}

const load = async () => {
  const catIndicesParams: CatIndicesParams = {
    h: ['index', 'health', 'pri', 'rep', 'status'],
    s: ['health:desc', 'index']
  }

  if (health.value) catIndicesParams['health'] = health.value

  const catIndices = callElasticsearch('catIndices', catIndicesParams)
  const catShards = callElasticsearch('catShards', CAT_SHARDS_PARAMS)
  const catNodes = callElasticsearch('catNodes', { h: ['name'] })

  const [indices, rawShards, nodes]: [EsShardIndex[], EsShard[], Partial<EsNode>[]] = await Promise.all([
    catIndices,
    catShards,
    catNodes
  ])
  shards.value = convertShards(rawShards, indices, nodes)
}

watch(health, load)
onMounted(load)

const CAT_SHARDS_PARAMS = {
  h: ['index', 'shard', 'prirep', 'state', 'node', 'docs', 'store', 'ip', 'node', 'unassigned.reason']
}
</script>
