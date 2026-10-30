<template>
  <tool-error :state="requests.indices.value" inspect="indices" />
  <template v-if="!requests.indices.value.apiError">
    <q-banner v-if="!blockedUserIndices.length" rounded class="tool-banner tool-banner--success">
      {{ t('tools.blocks.status_none') }}
    </q-banner>
    <template v-else>
      <q-select
        v-model="selected"
        outlined
        multiple
        use-chips
        emit-value
        map-options
        :label="t('tools.blocks.indices')"
        :options="options"
      >
        <template #selected-item="{ opt, index, removeAtIndex, tabindex }">
          <q-chip dense removable color="primary-dark" text-color="white" :tabindex="tabindex" @remove="removeAtIndex(index)">
            {{ opt.label }}
          </q-chip>
        </template>
      </q-select>
      <q-banner v-if="hasFloodBlock" rounded class="tool-banner tool-banner--warning q-mt-md">
        {{ t('tools.blocks.flood') }}
        {{ labels.floodState(floodState) }}
      </q-banner>
      <div class="row q-gutter-sm q-mt-md">
        <q-btn color="primary" :label="t('tools.blocks.clear')" :disable="!userBlockNames.length" @click="clearUserBlocks" />
        <q-btn
          v-if="hasFloodBlock && diskSafe === true"
          outline
          color="primary"
          :label="t('tools.blocks.clear_flood')"
          @click="clearFloodBlock"
        />
        <q-btn flat :label="t('tools.recheck')" @click="loadIndices" />
      </div>
    </template>
    <p class="font-13 text-muted q-mt-md">{{ t('tools.excluded_indices') }}</p>
  </template>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useInjectedClusterTools } from '../../composables/components/tools/ClusterTools.ts'
import { useToolLabels } from '../../composables/components/tools/ToolLabels.ts'
import { askConfirm } from '../../helpers/dialogs.ts'
import { parseByteValue } from '../../helpers/clusterTools.ts'
import ToolError from './ToolError.vue'

const t = useTranslation()
const labels = useToolLabels()
const { requests, blockedUserIndices, nodes, watermarkSettings, loadIndices, clearIndexBlocks } = useInjectedClusterTools()

const selected = ref<string[]>([])
const options = computed(() =>
  blockedUserIndices.value.map((index) => ({ label: `${index.name} (${index.blocks.join(', ')})`, value: index.name }))
)
const selectedStates = computed(() => blockedUserIndices.value.filter((index) => selected.value.includes(index.name)))
const userBlockNames = computed<string[]>(() => [
  ...new Set(selectedStates.value.flatMap((index) => index.blocks.filter((block) => block === 'write' || block === 'read_only')))
])
const hasFloodBlock = computed(() => selectedStates.value.some((index) => index.blocks.includes('read_only_allow_delete')))

const diskSafe = computed<boolean | null>(() => {
  const flood = String(watermarkSettings.flood.value.effectiveValue || '')
  if (!nodes.value.length) return null
  if (flood.endsWith('%')) {
    const threshold = Number(flood.slice(0, -1))
    if (!Number.isFinite(threshold) || nodes.value.some((node) => node.diskUsedPercent == null)) return null
    return nodes.value.every((node) => (node.diskUsedPercent || 0) < threshold)
  }
  const requiredFree = parseByteValue(flood)
  if (requiredFree == null || nodes.value.some((node) => node.diskAvailableBytes == null)) return null
  return nodes.value.every((node) => (node.diskAvailableBytes || 0) > requiredFree)
})
const floodState = computed(() => (diskSafe.value === null ? 'unknown' : diskSafe.value ? 'recovered' : 'full'))

const clearUserBlocks = async () => {
  const names = selectedStates.value
    .filter((index) => index.blocks.some((block) => userBlockNames.value.includes(block)))
    .map((index) => index.name)
  if (
    await askConfirm(
      t('tools.blocks.confirm_clear', { blocks: userBlockNames.value.join(', '), count: names.length }, names.length)
    )
  ) {
    await clearIndexBlocks(names, userBlockNames.value)
  }
}

const clearFloodBlock = async () => {
  const names = selectedStates.value.filter((index) => index.blocks.includes('read_only_allow_delete')).map((index) => index.name)
  if (await askConfirm(t('tools.blocks.confirm_clear_flood', { count: names.length }, names.length))) {
    await clearIndexBlocks(names, ['read_only_allow_delete'])
  }
}
</script>
