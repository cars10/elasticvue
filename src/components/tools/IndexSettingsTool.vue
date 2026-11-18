<template>
  <tool-error :state="requests.indices.value" inspect="indices" />
  <q-option-group v-model="setting" :options="settingOptions" type="radio" color="primary" inline class="q-mb-md" />
  <q-select v-model="selected" outlined multiple use-chips emit-value map-options :label="t('tools.indices')" :options="options">
    <template #selected-item="{ opt, index, removeAtIndex, tabindex }">
      <q-chip dense removable color="primary-dark" text-color="white" :tabindex="tabindex" @remove="removeAtIndex(index)">
        {{ opt.label }}
      </q-chip>
    </template>
  </q-select>
  <div class="font-13 text-muted q-mt-xs">{{ t('tools.current') }} {{ current }}</div>

  <q-input
    v-if="setting === 'replicas'"
    v-model.number="replicas"
    outlined
    type="number"
    min="0"
    step="1"
    :label="t('tools.replicas.count')"
    class="q-mt-md"
  />
  <template v-else>
    <q-select
      v-model="interval"
      outlined
      emit-value
      map-options
      :label="t('tools.refresh.interval')"
      :options="intervalOptions"
      class="q-mt-md"
    />
    <q-input
      v-if="interval === 'custom'"
      v-model="custom"
      outlined
      :label="t('tools.refresh.custom')"
      :hint="t('tools.refresh.custom_hint')"
      class="q-mt-md"
    />
  </template>
  <q-banner v-if="warning" rounded class="tool-banner tool-banner--warning q-mt-md">{{ warning }}</q-banner>
  <q-btn
    color="primary-dark"
    :label="t('tools.apply')"
    class="q-mt-md"
    :disable="!selected.length || !valid"
    :loading="requests.mutation.value.loading"
    @click="apply"
  />
  <p class="font-13 text-muted q-mt-md">{{ t('tools.excluded_indices') }}</p>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useInjectedClusterTools } from '../../composables/components/tools/ClusterTools.ts'
import { askConfirm } from '../../helpers/dialogs.ts'
import ToolError from './ToolError.vue'

const t = useTranslation()
const { requests, userIndices, setReplicas, setRefreshInterval } = useInjectedClusterTools()

const setting = ref<'replicas' | 'refreshInterval'>('replicas')
const selected = ref<string[]>([])
const replicas = ref(1)
const interval = ref('default')
const custom = ref('')

const settingOptions = computed(() => [
  { label: t('tools.replicas.title'), value: 'replicas' },
  { label: t('tools.refresh.title'), value: 'refreshInterval' }
])

const intervalLabel = (value: string | null) => {
  if (!value || value === 'default') return t('tools.status.default')
  if (value === '-1') return t('tools.status.disabled')
  return value
}
const intervalOptions = ['default', '1s', '5s', '30s', '-1', 'custom'].map((value) => ({
  label: value === 'custom' ? t('tools.refresh.custom') : intervalLabel(value),
  value
}))

const valueLabel = (index: { replicas: number | null; refreshInterval: string | null }) =>
  setting.value === 'replicas' ? String(index.replicas ?? '?') : intervalLabel(index.refreshInterval)

const options = computed(() =>
  userIndices.value.map((index) => ({ label: `${index.name} (${valueLabel(index)})`, value: index.name }))
)
const current = computed(() => {
  const values = new Set(userIndices.value.filter((index) => selected.value.includes(index.name)).map(valueLabel))
  if (!values.size) return '-'
  return values.size === 1 ? [...values][0] : t('tools.mixed')
})

const newInterval = computed(() => {
  if (interval.value === 'default') return null
  return interval.value === 'custom' ? custom.value : interval.value
})
const valid = computed(() => {
  if (setting.value === 'replicas') return Number.isInteger(replicas.value) && replicas.value >= 0
  return interval.value !== 'custom' || /^\d+(?:\.\d+)?(?:ms|s|m|h)$/.test(custom.value)
})
const warning = computed(() => {
  if (setting.value === 'replicas' && replicas.value === 0) return t('tools.replicas.zero_warning')
  if (setting.value === 'refreshInterval' && newInterval.value === '-1') return t('tools.refresh.disabled_warning')
  return ''
})

watch(setting, () => (selected.value = []))

const apply = async () => {
  const names = [...selected.value]
  const count = names.length
  const suffix = warning.value ? `\n\n${warning.value}` : ''
  if (setting.value === 'replicas') {
    if (await askConfirm(t('tools.replicas.confirm', { count, replicas: replicas.value }, count) + suffix)) {
      await setReplicas(names, replicas.value)
    }
    return
  }
  const value = newInterval.value
  if (await askConfirm(t('tools.refresh.confirm', { count, value: intervalLabel(value) }, count) + suffix)) {
    await setRefreshInterval(names, value)
  }
}
</script>
