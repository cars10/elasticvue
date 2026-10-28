<template>
  <tool-error :state="requests.settings.value" inspect="settings" />
  <template v-if="!requests.settings.value.apiError">
    <tool-current :value="labels.allocationMode(allocationMode)" :source="allocationSetting.source" />
    <q-banner v-if="allocationMode !== 'all' && unassignedShards.length" rounded class="tool-banner tool-banner--warning q-mb-md">
      {{ t('tools.allocation.blocking', { count: unassignedShards.length }, unassignedShards.length) }}
    </q-banner>
    <q-option-group v-model="draft" :options="options" type="radio" color="primary" />
    <tool-setting-hint :settings="['cluster.routing.allocation.enable']" :text="t('tools.allocation.hint')" />
    <div class="row q-gutter-sm">
      <q-btn
        color="primary"
        :label="draft === 'none' ? t('tools.allocation.disable') : t('tools.apply')"
        :loading="requests.mutation.value.loading"
        :disable="draft === allocationMode"
        @click="apply"
      />
      <q-btn v-if="canRestore" flat :label="t('tools.restore_default')" @click="restore" />
    </div>
  </template>
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

const t = useTranslation()
const labels = useToolLabels()
const { requests, allocationMode, allocationSetting, unassignedShards, setAllocation, capabilities } = useInjectedClusterTools()

const options = ['all', 'primaries', 'new_primaries', 'none'].map((value) => ({
  label: `${labels.allocationMode(value)} — ${labels.allocationHint(value)}`,
  value
}))
const draft = ref('all')
watch(allocationMode, (value) => (draft.value = value), { immediate: true })
const canRestore = computed(() => capabilities.settingsReset && allocationSetting.value.source !== 'default')

const apply = async () => {
  if (draft.value !== 'all' && !(await askConfirm(labels.allocationConfirm(draft.value)))) return
  await setAllocation(draft.value)
}

const restore = async () => {
  if (await askConfirm(t('tools.confirm_restore', { setting: t('tools.allocation.title') }))) await setAllocation(null)
}
</script>
