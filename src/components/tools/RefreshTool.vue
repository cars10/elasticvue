<template>
  <tool-error :state="requests.indices.value" inspect="indices" />
  <q-select
    v-model="selected"
    outlined
    multiple
    use-chips
    emit-value
    map-options
    :label="t('tools.indices')"
    :options="options"
  />
  <div class="font-13 text-muted q-mt-xs">{{ t('tools.current') }} {{ current }}</div>
  <q-select
    v-model="draft"
    outlined
    emit-value
    map-options
    :label="t('tools.refresh.interval')"
    class="q-mt-md"
    :options="intervalOptions"
  />
  <q-input
    v-if="draft === 'custom'"
    v-model="custom"
    outlined
    :label="t('tools.refresh.custom')"
    :hint="t('tools.refresh.custom_hint')"
    class="q-mt-md"
  />
  <q-banner v-if="draft === '-1'" rounded class="tool-banner tool-banner--warning q-mt-md">
    {{ t('tools.refresh.disabled_warning') }}
  </q-banner>
  <q-btn color="primary" :label="t('tools.apply')" class="q-mt-md" :disable="!selected.length || !valid" @click="apply" />
  <p class="font-13 text-muted q-mt-md">{{ t('tools.excluded_indices') }}</p>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'
import { useInjectedClusterTools } from '../../composables/components/tools/ClusterTools.ts'
import { askConfirm } from '../../helpers/dialogs.ts'
import ToolError from './ToolError.vue'

const t = useTranslation()
const { requests, userIndices, setRefreshInterval } = useInjectedClusterTools()

const selected = ref<string[]>([])
const draft = ref('default')
const custom = ref('')
const intervalLabel = (value: string | null) =>
  !value || value === 'default' ? t('tools.status.default') : value === '-1' ? t('tools.status.disabled') : value
const intervalOptions = ['default', '1s', '5s', '30s', '-1', 'custom'].map((value) => ({
  label: value === 'custom' ? t('tools.refresh.custom') : intervalLabel(value),
  value
}))
const options = computed(() =>
  userIndices.value.map((index) => ({ label: `${index.name} (${intervalLabel(index.refreshInterval)})`, value: index.name }))
)
const current = computed(() => {
  const values = new Set(
    userIndices.value.filter((index) => selected.value.includes(index.name)).map((index) => intervalLabel(index.refreshInterval))
  )
  if (!values.size) return '—'
  return values.size === 1 ? [...values][0] : t('tools.mixed')
})
const valid = computed(() => draft.value !== 'custom' || /^\d+(?:\.\d+)?(?:ms|s|m|h)$/.test(custom.value))

const apply = async () => {
  const value = draft.value === 'default' ? null : draft.value === 'custom' ? custom.value : draft.value
  const count = selected.value.length
  const warning = value === '-1' ? `\n\n${t('tools.refresh.disabled_warning')}` : ''
  if (await askConfirm(t('tools.refresh.confirm', { count, value: intervalLabel(value) }, count) + warning)) {
    await setRefreshInterval(selected.value, value)
  }
}
</script>
