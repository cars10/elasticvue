<template>
  <tool-error :state="requests.voting.value" inspect="voting" />
  <q-list v-if="votingExclusions.length" bordered separator class="rounded-borders q-mb-md">
    <q-item v-for="exclusion in votingExclusions" :key="exclusion.node_id || exclusion.node_name">
      <q-item-section>{{ exclusion.node_name || exclusion.node_id }}</q-item-section>
    </q-item>
  </q-list>
  <p class="q-mt-none">{{ t('tools.voting.explanation') }}</p>
  <q-select
    v-model="selected"
    outlined
    multiple
    use-chips
    emit-value
    map-options
    :label="t('tools.voting.nodes')"
    :options="nodeOptions"
  />
  <div class="row q-gutter-sm q-mt-md">
    <q-btn color="primary" :label="t('tools.voting.add')" :disable="!selected.length" @click="add" />
    <q-btn v-if="votingExclusions.length" outline color="primary" :label="t('tools.voting.clear')" @click="clear" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useInjectedClusterTools } from '../../composables/components/tools/ClusterTools.ts'
import { askConfirm } from '../../helpers/dialogs.ts'
import ToolError from './ToolError.vue'

const t = useTranslation()
const { requests, nodes, votingExclusions, addVotingExclusions, clearVotingExclusions } = useInjectedClusterTools()

const selected = ref<string[]>([])
const nodeOptions = computed(() =>
  nodes.value
    .filter((node) => node.roles.includes('master') || node.roles.includes('cluster_manager'))
    .map((node) => ({ label: `${node.name} (${node.id})`, value: node.id }))
)

const add = async () => {
  const count = selected.value.length
  if (await askConfirm(t('tools.voting.confirm_add', { count }, count))) await addVotingExclusions(selected.value)
}

const clear = async () => {
  if (await askConfirm(t('tools.voting.confirm_clear'))) await clearVotingExclusions()
}
</script>
