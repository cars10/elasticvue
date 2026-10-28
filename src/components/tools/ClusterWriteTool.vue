<template>
  <tool-error :state="requests.settings.value" inspect="settings" />
  <q-banner v-if="clusterWriteMode !== 'normal'" rounded class="tool-banner tool-banner--warning q-mb-md">
    {{ t('tools.cluster_write.restricted') }}
  </q-banner>
  <q-option-group v-model="draft" type="radio" color="primary" :options="options" />
  <tool-setting-hint :settings="['cluster.blocks.read_only', 'cluster.blocks.read_only_allow_delete']" />
  <q-btn color="primary" :label="t('tools.apply')" :disable="draft === clusterWriteMode" @click="apply" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useInjectedClusterTools } from '../../composables/components/tools/ClusterTools.ts'
import { useToolLabels } from '../../composables/components/tools/ToolLabels.ts'
import { askConfirm } from '../../helpers/dialogs.ts'
import ToolError from './ToolError.vue'
import ToolSettingHint from './ToolSettingHint.vue'

const t = useTranslation()
const labels = useToolLabels()
const { requests, clusterWriteMode, capabilities, setClusterWriteMode } = useInjectedClusterTools()

const options = ['normal', 'read_only', ...(capabilities.clusterReadOnlyAllowDelete ? ['allow_delete'] : [])].map((value) => ({
  label: labels.clusterWriteMode(value),
  value
}))
const draft = ref('normal')
watch(clusterWriteMode, (value) => (draft.value = value), { immediate: true })

const apply = async () => {
  if (draft.value !== 'normal' && !(await askConfirm(t('tools.cluster_write.confirm')))) return
  await setClusterWriteMode(draft.value)
}
</script>
