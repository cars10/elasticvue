<template>
  <tool-error :state="requests.settings.value" inspect="settings" />
  <tool-current :value="labels.rebalancingMode(rebalancingMode)" :source="rebalancingSetting.source" />
  <p>{{ t('tools.rebalancing.explanation') }}</p>
  <q-option-group v-model="draft" :options="options" type="radio" color="primary" />
  <tool-setting-hint :settings="['cluster.routing.rebalance.enable']" />
  <div class="row q-gutter-sm">
    <q-btn color="primary" :label="t('tools.apply')" :disable="draft === rebalancingMode" @click="apply" />
    <q-btn v-if="canRestore" flat :label="t('tools.restore_default')" @click="restore" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useInjectedClusterTools } from '../../composables/components/tools/ClusterTools.ts'
import { useToolLabels } from '../../composables/components/tools/ToolLabels.ts'
import { askConfirm } from '../../helpers/dialogs.ts'
import ToolError from './ToolError.vue'
import ToolCurrent from './ToolCurrent.vue'
import ToolSettingHint from './ToolSettingHint.vue'

const KEY = 'cluster.routing.rebalance.enable'

const t = useTranslation()
const labels = useToolLabels()
const { requests, rebalancingMode, rebalancingSetting, setClusterSettings, capabilities } = useInjectedClusterTools()

const options = ['all', 'primaries', 'replicas', 'none'].map((value) => ({
  label: labels.rebalancingMode(value),
  value
}))
const draft = ref('all')
watch(rebalancingMode, (value) => (draft.value = value), { immediate: true })
const canRestore = computed(() => capabilities.settingsReset && rebalancingSetting.value.source !== 'default')

const apply = async () => {
  if (draft.value !== 'all' && !(await askConfirm(t('tools.rebalancing.confirm')))) return
  await setClusterSettings({ [KEY]: draft.value }, t('tools.rebalancing.updated'))
}

const restore = async () => {
  if (await askConfirm(t('tools.confirm_restore', { setting: t('tools.rebalancing.title') }))) {
    await setClusterSettings({ [KEY]: null }, t('tools.rebalancing.updated'))
  }
}
</script>
