<template>
  <tool-error :state="requests.settings.value" inspect="settings" />
  <tool-current :value="recoverySetting.effectiveValue || t('tools.status.unavailable')" :source="recoverySetting.source" />
  <p>{{ t('tools.recovery.explanation') }}</p>
  <q-input v-model="draft" outlined :label="t('tools.recovery.limit')" :hint="t('tools.recovery.hint')" />
  <div v-if="draft && !valid" class="text-negative font-13 q-mt-sm">{{ t('tools.recovery.invalid') }}</div>
  <tool-setting-hint :settings="[KEY]" />
  <div class="row q-gutter-sm">
    <q-btn color="primary" :label="t('tools.apply')" :disable="!valid" @click="apply" />
    <q-btn v-if="canRestore" flat :label="t('tools.restore_default')" @click="restore" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useInjectedClusterTools } from '../../composables/components/tools/ClusterTools.ts'
import { askConfirm } from '../../helpers/dialogs.ts'
import ToolError from './ToolError.vue'
import ToolCurrent from './ToolCurrent.vue'
import ToolSettingHint from './ToolSettingHint.vue'

const KEY = 'indices.recovery.max_bytes_per_sec'

const t = useTranslation()
const { requests, recoverySetting, setClusterSettings, capabilities } = useInjectedClusterTools()

const draft = ref('')
watch(recoverySetting, (setting) => (draft.value = setting.effectiveValue || ''), { immediate: true })
const valid = computed(() => /^\d+(?:\.\d+)?(?:b|kb|mb|gb|tb|pb)$/i.test(draft.value))
const canRestore = computed(() => capabilities.settingsReset && recoverySetting.value.source !== 'default')

const apply = () => setClusterSettings({ [KEY]: draft.value }, t('tools.recovery.updated'))

const restore = async () => {
  if (await askConfirm(t('tools.confirm_restore', { setting: t('tools.recovery.title') }))) {
    await setClusterSettings({ [KEY]: null }, t('tools.recovery.updated'))
  }
}
</script>
