<template>
  <q-icon v-if="elasticsearchNode.master" :title="t('cluster_nodes.node_icons.master.title')" name="star" size="sm" />
  <q-icon
    v-else-if="elasticsearchNode.masterEligible"
    :title="t('cluster_nodes.node_icons.master_eligible.title')"
    name="star_outline"
    size="sm"
  />
  <q-icon v-if="elasticsearchNode.dataNode" :title="t('cluster_nodes.node_icons.data.title')" name="save" size="sm" />
  <q-icon
    v-if="elasticsearchNode.ingestNode"
    size="sm"
    :title="t('cluster_nodes.node_icons.ingest.title')"
    name="drive_file_move"
  />
  <q-icon
    v-if="elasticsearchNode.coordinatingNode"
    size="sm"
    :title="t('cluster_nodes.node_icons.coordinating_only.title')"
    name="route"
  />
</template>

<script setup lang="ts">
import ElasticsearchNode from '../../models/ElasticsearchNode'
import { useTranslation } from '../../composables/i18n'

defineProps<{ elasticsearchNode: ElasticsearchNode }>()

const t = useTranslation()
</script>
