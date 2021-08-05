<template>
  <span>
    <v-icon v-if="elasticsearchNode.master" :title="$t('nodes.node_icons.master.title')">mdi-star</v-icon>
    <v-icon v-else-if="elasticsearchNode.masterEligible" style="width: 24px"
            :title="$t('nodes.node_icons.master_eligible.title')">mdi-star-outline</v-icon>
    <v-icon v-if="elasticsearchNode.dataNode" :title="$t('nodes.node_icons.data.title')">mdi-content-save</v-icon>
    <v-icon v-if="elasticsearchNode.ingestNode"
            :title="$t('nodes.node_icons.ingest.title')">mdi-arrow-right-bold-box</v-icon>
    <v-icon v-if="elasticsearchNode.coordinatingNode"
            :title="$t('nodes.node_icons.coordinating_only.title')">mdi-transit-connection-variant</v-icon>
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
