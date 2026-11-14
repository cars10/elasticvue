<template>
  <tool-error :state="requests.settings.value" inspect="settings" />
  <q-toggle :model-value="destructiveEnabled" :label="t('tools.destructive.toggle')" color="primary" @update:model-value="set" />
  <p class="q-mt-md">{{ t('tools.destructive.explanation') }}</p>
  <tool-setting-hint :settings="[KEY]" />
  <q-btn v-if="canRestore" flat :label="t('tools.restore_default')" @click="restore" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useInjectedClusterTools } from '../../composables/components/tools/ClusterTools.ts'
import { askConfirm } from '../../helpers/dialogs.ts'
import ToolError from './ToolError.vue'
import ToolSettingHint from './ToolSettingHint.vue'

const KEY = 'action.destructive_requires_name'

const t = useTranslation()
const { requests, destructiveEnabled, destructiveSetting, setClusterSettings, capabilities } = useInjectedClusterTools()
const canRestore = computed(() => capabilities.settingsReset && destructiveSetting.value.source !== 'default')

const set = async (enabled: boolean) => {
  if (!enabled && !(await askConfirm(t('tools.destructive.confirm_disable')))) return
  await setClusterSettings({ [KEY]: enabled }, t('tools.destructive.updated'))
}

const restore = () => setClusterSettings({ [KEY]: null }, t('tools.destructive.updated'))
</script>
