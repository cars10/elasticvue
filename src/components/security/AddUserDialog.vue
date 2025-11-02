<template>
  <div>
    <q-dialog v-model="dialog" persistent>
      <q-card style="min-width: 420px">
        <q-card-section>
          <div class="text-h6">{{ t('security.add_user') }}</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form @submit.prevent="submit">
            <div class="q-mb-md">
              <q-input v-model="username" :label="t('security.user_form.username')" outlined />
            </div>

            <div class="q-mb-md">
              <q-select
                v-model="roles"
                :options="roleOptions"                
                :label="t('security.user_form.role')"
                multiple
                use-chips
                outlined
              />
            </div>

            <div class="q-mb-md">
              <q-input v-model="password" type="password" :label="t('security.user_form.password')" outlined />
            </div>

            <div class="row justify-end">
              <q-btn flat :label="t('defaults.cancel')" @click="dialog = false" />
              <q-btn color="primary-dark" class="q-ml-sm" :label="t('security.user_form.create')" type="submit" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
    import { ref, watch, onMounted } from 'vue'
    import { useTranslation } from '../../composables/i18n'
    import { useElasticsearchRequest } from '../../composables/CallElasticsearch'
    import { handleError } from '../../helpers/error'

    const props = defineProps<{
        modelValue?: boolean
        createUser: (username: string, roles: string[], password: string) => Promise<any>
    }>()

    const emit = defineEmits(['update:modelValue', 'created'])

    const t = useTranslation()
    const dialog = ref(false)
    const username = ref('')
    const roles = ref<string[]>([])
    const password = ref('')
    const roleOptions = ref<string[]>([])

    const { data: rolesData, load: loadRoles } = useElasticsearchRequest('getRoles')

    onMounted(() => loadRoles())

    watch(rolesData, (val) => {
        if (!val) return
        roleOptions.value = Object.keys(val)
        if (roleOptions.value.length > 0) roles.value = [roleOptions.value[0]]
        })

    watch(() => props.modelValue, (v) => (dialog.value = !!v))
    watch(dialog, (v) => emit('update:modelValue', v))

    const submit = async () => {
        if (!username.value || roles.value.length === 0 || !password.value) return

        try {
            await props.createUser(username.value, roles.value, password.value)
            emit('created')
            dialog.value = false
            // reset
            username.value = ''
            password.value = ''
            roles.value = roleOptions.value.length > 0 ? [roleOptions.value[0]] : []
        } catch (e) {
            handleError(e)
        }
    }
</script>
