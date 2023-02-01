<template>
  <q-card>
    <q-card-section>
      <h2 class="text-h5 q-my-none d-inline-block">
        {{ $t('shards.heading') }}
      </h2>
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
  import { useI18n } from 'vue-i18n/dist/vue-i18n.cjs'
  import ReloadButton from '../shared/ReloadButton.vue'
  import LoaderStatus from '../shared/LoaderStatus.vue'
  import { useElasticsearchAdapter } from '../../composables/RequestComposition'
  import { convertShards } from '../../helpers/shards'
  import ShardsTable from './ShardsTable.vue'

  const { t } = useI18n()
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
