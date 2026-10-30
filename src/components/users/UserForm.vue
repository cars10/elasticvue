<template>
  <q-form @submit="emit('submit')">
    <q-card-section>
      <custom-input
        v-model="user.username"
        :label="t('cluster_users.new_user.form.username.label')"
        class="q-mb-md"
        name="username"
        lazy-rules
        autocomplete="off"
        :autofocus="!isEdit"
        outlined
        required
        :readonly="isEdit"
        :disable="reserved"
      />

      <custom-input
        v-model="user.password"
        :label="passwordLabel"
        class="q-mb-md"
        name="password"
        lazy-rules
        autocomplete="new-password"
        outlined
        :required="!isEdit || reserved"
        :autofocus="isEdit"
        :type="passwordVisible ? 'text' : 'password'"
        :hint="isEdit && !reserved ? t('cluster_users.edit_user.form.password.hint') : undefined"
      >
        <template #append>
          <q-icon
            :name="passwordVisible ? 'visibility' : 'visibility_off'"
            class="cursor-pointer"
            @click="passwordVisible = !passwordVisible"
          />
        </template>
      </custom-input>

      <q-select
        v-model="user.roles"
        :options="filteredRoleOptions"
        :label="t('cluster_users.new_user.form.roles.label')"
        :loading="rolesLoading"
        :disable="reserved"
        class="q-mb-md"
        data-testid="user-form-roles"
        multiple
        use-chips
        use-input
        outlined
        options-dense
        input-debounce="0"
        @filter="filterRoles"
      >
        <template #selected-item="{ opt, index, removeAtIndex, tabindex }">
          <q-chip dense removable color="primary-dark" text-color="white" :tabindex="tabindex" @remove="removeAtIndex(index)">
            {{ opt }}
          </q-chip>
        </template>
      </q-select>

      <custom-input
        v-model="user.full_name"
        :label="t('cluster_users.new_user.form.full_name.label')"
        class="q-mb-md"
        autocomplete="off"
        outlined
        :disable="reserved"
      />

      <custom-input
        v-model="user.email"
        :label="t('cluster_users.new_user.form.email.label')"
        class="q-mb-md"
        autocomplete="off"
        outlined
        type="email"
        :disable="reserved"
      />

      <q-checkbox
        v-if="supportsUserEnabledInBody()"
        v-model="user.enabled"
        size="32px"
        :label="t('cluster_users.new_user.form.enabled.label')"
        :disable="reserved"
      />
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
import { computed, ref } from 'vue'
import { useTranslation } from '../../composables/i18n'
import CustomInput from '../shared/CustomInput.vue'
import { UserFormData } from '../../composables/components/users/UserForm.ts'
import { supportsUserEnabledInBody } from '../../helpers/securitySupport.ts'

const t = useTranslation()
const passwordVisible = ref(false)

const props = withDefaults(
  defineProps<{
    modelValue: UserFormData
    formValid: boolean
    loading: boolean
    rolesLoading: boolean
    filteredRoleOptions: string[]
    isEdit?: boolean
    reserved?: boolean
    submitLabel: string
    submitId?: string
  }>(),
  {
    isEdit: false,
    reserved: false,
    submitId: undefined
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: UserFormData]
  submit: []
  filterRoles: [val: string, update: (fn: () => void) => void]
}>()

const user = computed({
  get: () => props.modelValue,
  set: (value: UserFormData) => emit('update:modelValue', value)
})

const passwordLabel = computed(() =>
  props.isEdit ? t('cluster_users.edit_user.form.password.label') : t('cluster_users.new_user.form.password.label')
)

const filterRoles = (val: string, update: (fn: () => void) => void) => {
  emit('filterRoles', val, update)
}
</script>
