<template>
  <tool-error :state="requests.settings.value" inspect="settings" />
  <div v-if="fullestNode" class="q-mb-md">
    <span class="text-muted">{{ t('tools.watermarks.fullest') }}</span>
    <strong class="q-ml-sm">{{ fullestNode.name }}</strong>
    {{ t('tools.watermarks.used', { percent: fullestNode.diskUsedPercent }) }}
    <span v-if="fullestNode.diskAvailableBytes != null" class="text-muted">
      ({{ t('tools.watermarks.available', { bytes: prettyPrintByteString(fullestNode.diskAvailableBytes) }) }})
    </span>
  </div>

  <q-input v-model="draft.low" outlined :label="t('tools.watermarks.low')" :hint="t('tools.watermarks.low_hint')" />
  <q-input
    v-model="draft.high"
    outlined
    :label="t('tools.watermarks.high')"
    class="q-mt-md"
    :hint="t('tools.watermarks.high_hint')"
  />
  <q-input
    v-if="capabilities.floodStage"
    v-model="draft.flood"
    outlined
    :label="t('tools.watermarks.flood')"
    class="q-mt-md"
    :hint="t('tools.watermarks.flood_hint')"
  />
  <q-banner v-if="!validation.valid" rounded class="tool-banner tool-banner--danger q-mt-md">{{
    labels.watermarkError(validation.error)
  }}</q-banner>
  <p v-else class="font-13 text-muted q-mt-md">{{ labels.watermarkMode(validation.mode) }}</p>

  <q-expansion-item :label="t('tools.advanced')" dense class="q-mb-md">
    <div class="q-pt-md">
      <q-toggle v-model="advanced.thresholdEnabled" :label="t('tools.watermarks.threshold_enabled')" color="primary" />
      <q-banner v-if="!advanced.thresholdEnabled" rounded class="tool-banner tool-banner--danger q-my-md">
        {{ t('tools.watermarks.threshold_disabled_warning') }}
      </q-banner>
      <template v-if="capabilities.maxHeadroom">
        <q-input
          v-for="level in HEADROOM_LEVELS"
          :key="level"
          v-model="advanced[level]"
          outlined
          :label="labels.watermark(level)"
          :hint="t('tools.watermarks.headroom_hint')"
          class="q-mt-md"
        />
        <div v-if="headroomInvalid" class="text-negative font-13 q-mt-sm">{{ t('tools.watermarks.errors.headroom') }}</div>
      </template>
    </div>
  </q-expansion-item>

  <tool-setting-hint :settings="['cluster.routing.allocation.disk.watermark.*']" :text="t('tools.watermarks.lowering_warning')" />
  <div class="row q-gutter-sm">
    <q-btn color="primary" :label="t('tools.apply')" :disable="!validation.valid || headroomInvalid" @click="apply" />
    <q-btn v-if="watermarksCustom && capabilities.settingsReset" flat :label="t('tools.restore_default')" @click="restore" />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useInjectedClusterTools } from '../../composables/components/tools/ClusterTools.ts'
import { useToolLabels } from '../../composables/components/tools/ToolLabels.ts'
import { askConfirm } from '../../helpers/dialogs.ts'
import { parseByteValue, validateWatermarks } from '../../helpers/clusterTools.ts'
import { prettyPrintByteString } from '../../helpers/bytes.ts'
import ToolError from './ToolError.vue'
import ToolSettingHint from './ToolSettingHint.vue'

const HEADROOM_LEVELS = ['lowMaxHeadroom', 'highMaxHeadroom', 'floodMaxHeadroom'] as const

const t = useTranslation()
const labels = useToolLabels()
const { requests, nodes, capabilities, watermarkSettings: s, watermarksCustom, setWatermarks } = useInjectedClusterTools()

const draft = reactive({ low: '85%', high: '90%', flood: '95%' })
const advanced = reactive({ thresholdEnabled: true, lowMaxHeadroom: '', highMaxHeadroom: '', floodMaxHeadroom: '' })
watch(
  () => Object.values(s).map((setting) => setting.value.effectiveValue),
  () => {
    draft.low = String(s.low.value.effectiveValue || '85%')
    draft.high = String(s.high.value.effectiveValue || '90%')
    draft.flood = String(s.flood.value.effectiveValue || '95%')
    advanced.thresholdEnabled = String(s.thresholdEnabled.value.effectiveValue) !== 'false'
    for (const level of HEADROOM_LEVELS) advanced[level] = String(s[level].value.effectiveValue || '')
  },
  { immediate: true }
)

const validation = computed(() => validateWatermarks(draft))
const headroomInvalid = computed(
  () =>
    capabilities.maxHeadroom &&
    HEADROOM_LEVELS.some((level) => advanced[level].trim() && parseByteValue(advanced[level]) === null)
)
const fullestNode = computed(
  () =>
    [...nodes.value]
      .filter((node) => node.diskUsedPercent != null)
      .sort((a, b) => (b.diskUsedPercent || 0) - (a.diskUsedPercent || 0))[0]
)

const apply = async () => {
  if (!advanced.thresholdEnabled && !(await askConfirm(t('tools.watermarks.threshold_disabled_warning')))) return
  const summary = (['low', 'high', 'flood'] as const)
    .map((level) => `${labels.watermark(level)}: ${s[level].value.effectiveValue} → ${draft[level]}`)
    .join('\n')
  if (!(await askConfirm(`${t('tools.watermarks.confirm')}\n\n${summary}`))) return
  await setWatermarks({
    ...draft,
    thresholdEnabled: advanced.thresholdEnabled,
    lowMaxHeadroom: advanced.lowMaxHeadroom || null,
    highMaxHeadroom: advanced.highMaxHeadroom || null,
    floodMaxHeadroom: advanced.floodMaxHeadroom || null
  })
}

const restore = async () => {
  if (await askConfirm(t('tools.confirm_restore', { setting: t('tools.watermarks.title') }))) await setWatermarks(null)
}
</script>
