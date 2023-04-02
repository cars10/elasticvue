<template>
  <q-icon v-if="elasticsearchNode.master" :title="$t('nodes.node_icons.master.title')" name="star" size="sm" />
  <q-icon v-else-if="elasticsearchNode.masterEligible" :title="$t('nodes.node_icons.master_eligible.title')"
          name="star_outline" size="sm" />
  <q-icon v-if="elasticsearchNode.dataNode" :title="$t('nodes.node_icons.data.title')" name="save" size="sm" />
  <q-icon v-if="elasticsearchNode.ingestNode" size="sm"
          :title="$t('nodes.node_icons.ingest.title')" name="drive_file_move" />
  <q-icon v-if="elasticsearchNode.coordinatingNode" size="sm"
          :title="$t('nodes.node_icons.coordinating_only.title')" name="route" />
</template>

<script setup>
  import ElasticsearchNode from '../../models/ElasticsearchNode'

  defineProps({
    elasticsearchNode: {
      type: ElasticsearchNode,
      default: () => {
        return new ElasticsearchNode()
      }
    }
  })
</script>
