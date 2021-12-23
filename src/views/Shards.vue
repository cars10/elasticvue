<template>
  <v-card>
    <v-card-title>
      <h2 class="text-h5">{{ $t('shards.heading') }}</h2>
      <reload-button id="reload-indices" :action="load"/>
    </v-card-title>
    <v-divider/>

    <loader hide-progress>
      <shards-table :shards="shards || {}" :loading="loading"/>
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
      const loading = ref(true)
      const load = async () => {
        loading.value = true
        const indices = await callElasticsearch('catIndices', { h: ['index', 'health', 'pri', 'rep'], s: ['index'] })
        const indexNames = indices.map(i => i.index)
        const rawShards = await callElasticsearch('catShards', CAT_METHOD_PARAMS, indexNames.join(','))

        shards.value = convertSource(rawShards, indices)
        loading.value = false
      }
      onMounted(load)

      const debouncedFilterTable = debounce(load, 250)
      watch(filter, debouncedFilterTable)

      return {
        shards,
        load,
        loading
      }
    }
  }
</script>
