<template>
  <tool-error :state="requests.settings.value" inspect="settings" />
  <q-option-group v-model="mode" type="radio" color="primary" :options="options" />
  <q-input
    v-if="mode === 'custom'"
    v-model="rules"
    outlined
    autogrow
    type="textarea"
    :label="t('tools.auto_create.rules')"
    hint="+logs-*,+metrics-*,-temp-*,-*"
    class="q-mt-md"
  />
  <tool-setting-hint :settings="[KEY]" :text="t('tools.auto_create.hint')" />
  <q-btn color="primary" :label="t('tools.apply')" @click="apply" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useInjectedClusterTools } from '../../composables/components/tools/ClusterTools.ts'
import { useToolLabels } from '../../composables/components/tools/ToolLabels.ts'
import { askConfirm } from '../../helpers/dialogs.ts'
import ToolError from './ToolError.vue'
import ToolSettingHint from './ToolSettingHint.vue'

const KEY = 'action.auto_create_index'

const t = useTranslation()
const labels = useToolLabels()
const { requests, autoCreateSetting, setClusterSettings, capabilities } = useInjectedClusterTools()

const modes = capabilities.settingsReset ? ['default', 'allow', 'disable', 'custom'] : ['allow', 'disable', 'custom']
const options = modes.map((value) => ({
  label: labels.autoCreateMode(value),
  value
}))
const mode = ref('default')
const rules = ref('')
watch(
  autoCreateSetting,
  ({ configuredValue: value }) => {
    if (value === null) mode.value = capabilities.settingsReset ? 'default' : 'allow'
    else if (value === true || value === 'true') mode.value = 'allow'
    else if (value === false || value === 'false') mode.value = 'disable'
    else {
      mode.value = 'custom'
      rules.value = String(value)
    }
  },
  { immediate: true }
)

const apply = async () => {
  const customRules = rules.value
    .split(/[,\n]/)
    .map((rule) => rule.trim())
    .filter(Boolean)
    .join(',')
  const value = { default: null, allow: true, disable: false, custom: customRules }[mode.value] ?? null
  if (mode.value === 'custom' && !customRules) return
  if (mode.value === 'disable' && !(await askConfirm(t('tools.auto_create.confirm_disable')))) return
  await setClusterSettings({ [KEY]: value }, t('tools.auto_create.updated'))
}
</script>
