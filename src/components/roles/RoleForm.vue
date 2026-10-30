<template>
  <q-form @submit="emit('submit')">
    <q-card-section>
      <custom-input
        v-model="role.name"
        :label="t('cluster_roles.new_role.form.name.label')"
        class="q-mb-md"
        name="name"
        lazy-rules
        autocomplete="off"
        :autofocus="!isEdit"
        outlined
        required
        :readonly="isEdit"
      />

      <custom-input
        v-if="supportsRoleDescription()"
        v-model="role.description"
        :label="t('cluster_roles.new_role.form.description.label')"
        class="q-mb-md"
        name="description"
        autocomplete="off"
        outlined
      />

      <q-select
        v-model="role.cluster"
        :options="clusterOptions"
        :label="t('cluster_roles.new_role.form.cluster.label')"
        class="q-mb-md"
        data-testid="role-form-cluster"
        multiple
        use-input
        new-value-mode="add-unique"
        outlined
        options-dense
        input-debounce="0"
        @filter="filterClusterOptions"
      />

      <div class="flex items-center q-mb-sm">
        <span class="text-body2">{{ t('cluster_roles.new_role.form.indices.label') }}</span>
        <q-icon name="help" size="xs" class="q-ml-xs cursor-pointer" data-testid="role-indices-help">
          <q-tooltip class="bg-dark text-body2" style="max-width: 420px; white-space: pre-wrap" :delay="200">
            <div>{{ t('cluster_roles.new_role.form.indices.help') }}</div>
            <pre class="q-mt-sm q-mb-none">{{ INDICES_JSON_EXAMPLE }}</pre>
          </q-tooltip>
        </q-icon>
      </div>
      <resizable-container v-model="resizeStore.roleFormIndices" class="q-mb-md">
        <code-editor v-model="role.indicesJson" data-testid="role-form-indices" />
      </resizable-container>

      <div class="flex items-center q-mb-sm">
        <span class="text-body2">{{ t('cluster_roles.new_role.form.run_as.label') }}</span>
        <q-icon name="help" size="xs" class="q-ml-xs cursor-pointer" data-testid="role-run-as-help">
          <q-tooltip class="bg-dark text-body2" style="max-width: 420px; white-space: pre-wrap" :delay="200">
            {{ t('cluster_roles.new_role.form.run_as.help') }}
          </q-tooltip>
        </q-icon>
      </div>
      <q-select
        v-model="role.run_as"
        class="q-mb-md"
        data-testid="role-form-run-as"
        multiple
        use-chips
        use-input
        hide-dropdown-icon
        hide-bottom-space
        new-value-mode="add-unique"
        outlined
        options-dense
        :options="[]"
      >
        <template #selected-item="{ opt, index, removeAtIndex, tabindex }">
          <q-chip dense removable color="primary-dark" text-color="white" :tabindex="tabindex" @remove="removeAtIndex(index)">
            {{ opt }}
          </q-chip>
        </template>
      </q-select>
    </q-card-section>

    <q-card-section>
      <q-btn
        :id="submitId"
        :disable="loading || !formValid"
        :loading="loading"
        :label="submitLabel"
        color="positive"
        type="submit"
        class="q-mr-md"
      />
      <q-btn v-close-popup flat :label="t('defaults.close')" />
    </q-card-section>
  </q-form>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'
import { useTranslation } from '../../composables/i18n'
import CustomInput from '../shared/CustomInput.vue'
import ResizableContainer from '../shared/ResizableContainer.vue'
import { useResizeStore } from '../../store/resize'
import {
  CLUSTER_PRIVILEGE_OPTIONS,
  INDICES_JSON_EXAMPLE,
  RoleFormData,
  supportsRoleDescription
} from '../../composables/components/roles/RoleForm.ts'

const CodeEditor = defineAsyncComponent(() => import('../shared/CodeEditor.vue'))

const t = useTranslation()
const resizeStore = useResizeStore()
const clusterOptions = ref([...CLUSTER_PRIVILEGE_OPTIONS])

const props = withDefaults(
  defineProps<{
    modelValue: RoleFormData
    formValid: boolean
    loading: boolean
    isEdit?: boolean
    submitLabel: string
    submitId?: string
  }>(),
  {
    isEdit: false,
    submitId: undefined
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: RoleFormData]
  submit: []
}>()

const role = computed({
  get: () => props.modelValue,
  set: (value: RoleFormData) => emit('update:modelValue', value)
})

const filterClusterOptions = (val: string, update: (fn: () => void) => void) => {
  if (!val) {
    update(() => (clusterOptions.value = [...CLUSTER_PRIVILEGE_OPTIONS]))
    return
  }

  const search = val.toLowerCase()
  update(() => {
    clusterOptions.value = CLUSTER_PRIVILEGE_OPTIONS.filter((option) => option.toLowerCase().includes(search))
  })
}
</script>
