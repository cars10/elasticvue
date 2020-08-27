<template>
  <span>
    <v-icon v-if="elasticsearchNode.master" title="master node">mdi-star</v-icon>
    <v-icon v-else-if="elasticsearchNode.masterEligible" style="width: 24px"
            title="master eligible">mdi-star-outline</v-icon>
    <v-icon v-if="elasticsearchNode.dataNode" title="data node">mdi-content-save</v-icon>
    <v-icon v-if="elasticsearchNode.ingestNode" title="ingest node">mdi-arrow-right-bold-box</v-icon>
    <v-icon v-if="elasticsearchNode.coordinatingNode"
            title="coordinating only node">mdi-transit-connection-variant</v-icon>
  </span>
</template>

<script>
  import ElasticsearchNode from '@/models/ElasticsearchNode'

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
