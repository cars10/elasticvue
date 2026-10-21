<template>
  <div class="row q-pa-lg">
    <q-card class="col-6 offset-3">
      <q-card-section>
        <h2 class="text-h6 q-my-none">{{ t('setup.cluster_login.heading', { name: cluster?.name }) }}</h2>
        <p class="q-mt-sm q-mb-none text-muted">{{ t('setup.cluster_login.hint') }}</p>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-form @submit.prevent="login">
          <custom-input
            v-model="username"
            outlined
            :rules="[required]"
            :label="t('setup.test_and_connect.form.username.label')"
            autocomplete="off"
            class="q-mb-md"
            data-testid="cluster-login-username"
          />

          <custom-input
            v-model="password"
            outlined
            :rules="[required]"
            :label="t('setup.test_and_connect.form.password.label')"
            :type="passwordVisible ? 'text' : 'password'"
            autocomplete="off"
            autofocus
            class="q-mb-md"
            data-testid="cluster-login-password"
          >
            <template #append>
              <q-icon
                :name="passwordVisible ? 'visibility' : 'visibility_off'"
                class="cursor-pointer"
                @click="passwordVisible = !passwordVisible"
              />
            </template>
          </custom-input>

          <q-btn
            :label="t('setup.cluster_login.login')"
            :loading="loading"
            color="primary-dark"
            type="submit"
            data-testid="cluster-login-submit"
          />

          <p v-if="errorMessage" class="q-mt-md q-mb-none text-negative">{{ errorMessage }}</p>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'
import { AuthType, useConnectionStore } from '../../store/connection.ts'
import ElasticsearchAdapter from '../../services/ElasticsearchAdapter.ts'
import CustomInput from '../shared/CustomInput.vue'

const t = useTranslation()
const connectionStore = useConnectionStore()
const cluster = computed(() => connectionStore.activeCluster)

const username = ref(cluster.value?.auth.authType === AuthType.basicAuth ? cluster.value.auth.authData.username : '')
const password = ref('')
const passwordVisible = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const required = (val: string) => !!val || 'required'

// Check the credentials first, so a typo shows here instead of a broken cluster view.
// Then reload, like after any other cluster change, so every component starts with the new credentials.
const login = async () => {
  if (!cluster.value || typeof connectionStore.activeClusterIndex !== 'number') return

  loading.value = true
  errorMessage.value = ''

  const auth = { authType: AuthType.basicAuth as const, authData: { username: username.value, password: password.value } }
  try {
    await new ElasticsearchAdapter({ ...cluster.value, auth }).test()
  } catch (e: any) {
    loading.value = false
    errorMessage.value = e.status ? `${e.status} ${e.statusText}`.trim() : e.message || t('setup.cluster_login.error')
    return
  }

  connectionStore.setSessionCredentials({
    index: connectionStore.activeClusterIndex,
    username: username.value,
    password: password.value
  })
  window.location.reload()
}
</script>
