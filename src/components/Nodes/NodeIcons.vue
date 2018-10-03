<template>
  <span>
    <v-icon v-if="elasticsearchNode.master" title="master node">star</v-icon>
    <v-icon v-else-if="elasticsearchNode.masterEligible" title="master eligible" style="width: 24px">star_bordered</v-icon>
    <v-icon v-if="elasticsearchNode.dataNode" title="data node">save</v-icon>
    <v-icon v-if="elasticsearchNode.ingestNode" title="ingest node">input</v-icon>
    <v-icon v-if="elasticsearchNode.coordinatingNode" title="coordinating only node">transform</v-icon>
  </span>
</template>

<script>
  import ElasticsearchNode from '../../models/ElasticsearchNode'

  export default {
    name: 'node-icons',
    props: {
      elasticsearchNode: {
        type: ElasticsearchNode,
        default: () => {
          return new ElasticsearchNode()
        }
      }
    }
  }
</script>
