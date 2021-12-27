<template>
  <v-card>
    <v-card-title>
      <h2 class="text-h5">{{ $t('shards.heading') }}</h2>
      <reload-button id="reload-indices" :action="load" :default-setting="15"/>
    </v-card-title>
    <v-divider/>

    <loader hide-progress>
      <shards-table :shards="shards || {}" @reload="load"/>
    </loader>
  </v-card>
</template>

<script>
  import ReloadButton from '@/components/shared/ReloadButton'
  import ShardsTable from '@/components/Shards/ShardsTable'
  import Loader from '@/components/shared/Loader'
  import { useElasticsearchRequest } from '@/mixins/RequestComposition'
  import { onMounted, ref, watch } from '@vue/composition-api'
  import { debounce } from '@/helpers'
  import { convertSource } from '@/models/Shards'

  export default {
    name: 'shards',
    components: {
      Loader,
      ReloadButton,
      ShardsTable
    },
    setup () {
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

      const { callElasticsearch } = useElasticsearchRequest()
      const filter = ref('')
      const shards = ref({})
      const load = async () => {
        const indices = await callElasticsearch('catIndices', {
          h: ['index', 'health', 'pri', 'rep', 'status'],
          s: ['index']
        })
        const indexNames = indices.filter(i => i.status === 'open').map(i => i.index)
        const rawShards = await callElasticsearch('catShards', CAT_METHOD_PARAMS, indexNames.join(','))

        shards.value = convertSource(rawShards, indices)
      }
      onMounted(load)

      const debouncedFilterTable = debounce(load, 250)
      watch(filter, debouncedFilterTable)

      return {
        shards,
        load
      }
    }
  }
</script>
