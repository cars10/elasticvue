<template>
  <tool-error :state="requests.indices.value" inspect="indices" />
  <q-banner v-if="singleNodeReplicaIndices.length" rounded class="tool-banner tool-banner--warning q-mb-md">
    {{ t('tools.replicas.single_node', { count: singleNodeReplicaIndices.length }, singleNodeReplicaIndices.length) }}
    <template #action>
      <q-btn flat :label="t('tools.replicas.set_zero')" @click="setAffectedToZero" />
    </template>
  </q-banner>

  <q-select v-model="selected" outlined multiple use-chips emit-value map-options :label="t('tools.indices')" :options="options">
    <template #selected-item="{ opt, index, removeAtIndex, tabindex }">
      <q-chip dense removable color="primary-dark" text-color="white" :tabindex="tabindex" @remove="removeAtIndex(index)">
        {{ opt.label }}
      </q-chip>
    </template>
  </q-select>
  <div class="font-13 text-muted q-mt-xs">{{ t('tools.current') }} {{ current }}</div>
  <q-input v-model.number="draft" outlined type="number" min="0" step="1" :label="t('tools.replicas.count')" class="q-mt-md" />
  <q-banner v-if="draft === 0" rounded class="tool-banner tool-banner--warning q-mt-md">{{
    t('tools.replicas.zero_warning')
  }}</q-banner>
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
const { requests, userIndices, singleNodeReplicaIndices, setReplicas } = useInjectedClusterTools()

const selected = ref<string[]>([])
const draft = ref(1)
const options = computed(() =>
  userIndices.value.map((index) => ({ label: `${index.name} (${index.replicas ?? '?'})`, value: index.name }))
)
const current = computed(() => {
  const values = new Set(userIndices.value.filter((index) => selected.value.includes(index.name)).map((index) => index.replicas))
  if (!values.size) return '—'
  return values.size === 1 ? String([...values][0]) : t('tools.mixed')
})
const valid = computed(() => Number.isInteger(draft.value) && draft.value >= 0)

const apply = async () => {
  const count = selected.value.length
  const warning = draft.value === 0 ? `\n\n${t('tools.replicas.zero_warning')}` : ''
  if (await askConfirm(t('tools.replicas.confirm', { count, replicas: draft.value }, count) + warning)) {
    await setReplicas(selected.value, draft.value)
  }
}

const setAffectedToZero = async () => {
  const names = singleNodeReplicaIndices.value.map((index) => index.name)
  if (await askConfirm(t('tools.replicas.confirm_zero', { count: names.length }, names.length))) await setReplicas(names, 0)
}
</script>
