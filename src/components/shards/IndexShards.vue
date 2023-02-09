<template>
  <q-card>
    <q-card-section class="flex items-center">
      <h1 class="text-h5 q-my-none">
        {{ $t('shards.heading') }}
      </h1>
      <reload-button :action="load" />
    </q-card-section>

    <q-separator />

    <loader-status :request-state="requestState">
      <shards-table :shards="shards || {}" @reload="load" />
    </loader-status>
  </q-card>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { useTranslation } from '../../composables/i18n'
  import ReloadButton from '../shared/ReloadButton.vue'
  import LoaderStatus from '../shared/LoaderStatus.vue'
  import { useElasticsearchAdapter } from '../../composables/CallElasticsearch'
  import { convertShards } from '../../helpers/shards'
  import ShardsTable from './ShardsTable.vue'

  const t = useTranslation()
  const shards = ref({})

  const { requestState, callElasticsearch } = useElasticsearchAdapter()
  const load = async () => {
    const indices = await callElasticsearch('catIndices', {
      h: ['index', 'health', 'pri', 'rep', 'status'],
      s: ['index']
    })
    const rawShards = await callElasticsearch('catShards', CAT_METHOD_PARAMS, '*')

    shards.value = convertShards(rawShards, indices)
  }

  onMounted(load)

  const CAT_METHOD_PARAMS = {
    h: [
      'index',
      'shard',
      'prirep',
      'state',
      'docs',
      'store',
      'ip',
      'node',
      'unassigned.reason'
    ]
  }
</script>
