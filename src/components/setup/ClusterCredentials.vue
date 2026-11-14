<template>
  <div class="row q-pa-lg">
    <q-card v-if="cluster" class="col-12 col-md-6 offset-md-3" data-testid="cluster-credentials">
      <q-card-section>
        <h2 class="text-h6 q-my-none">{{ t('setup.cluster_credentials.heading', { name: cluster.name }) }}</h2>
        <p class="q-mt-sm q-mb-none text-muted">{{ t('setup.cluster_credentials.hint') }}</p>
      </q-card-section>

      <q-separator />

      <q-form @submit.prevent="login">
        <q-card-section class="q-gutter-md">
          <custom-input
            v-for="field in fields"
            :key="field.name"
            v-model="values[field.name]"
            outlined
            :rules="field.optional ? [] : [required]"
            :label="field.label"
            :type="field.secret && !visible ? 'password' : 'text'"
            :autofocus="field.autofocus"
            autocomplete="off"
            :data-testid="`cluster-credentials-${field.name}`"
          >
            <template v-if="field.secret" #append>
              <q-icon :name="visible ? 'visibility' : 'visibility_off'" class="cursor-pointer" @click="visible = !visible" />
            </template>
          </custom-input>

          <p v-if="errorMessage" class="q-mb-none text-negative" data-testid="cluster-credentials-error">{{ errorMessage }}</p>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            :label="t('setup.cluster_credentials.login')"
            :loading="loading"
            unelevated
            color="primary-dark"
            type="submit"
            data-testid="cluster-credentials-submit"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'
import { AuthType, useConnectionStore } from '../../store/connection.ts'
import { useClusterSession } from '../../store/clusterSession.ts'
import { useSessionCredentials } from '../../store/sessionCredentials.ts'
import { AuthFields, IDENTITY_FIELDS, pickFields, SECRET_FIELDS, withFields } from '../../helpers/auth.ts'
import ElasticsearchAdapter from '../../services/ElasticsearchAdapter.ts'
import CustomInput from '../shared/CustomInput.vue'

const t = useTranslation()
const connectionStore = useConnectionStore()
const session = useClusterSession()
const credentials = useSessionCredentials()
const cluster = computed(() => connectionStore.clusterById(session.clusterId))

const LABELS: Record<string, () => string> = {
  username: () => t('setup.test_and_connect.form.username.label'),
  password: () => t('setup.test_and_connect.form.password.label'),
  apiKey: () => t('setup.test_and_connect.form.api_key.label'),
  accessKeyId: () => t('setup.test_and_connect.form.access_key_id.label'),
  secretAccessKey: () => t('setup.test_and_connect.form.secret_access_key.label'),
  sessionToken: () => t('setup.test_and_connect.form.session_token.label')
}

const authType = computed(() => cluster.value?.auth.authType ?? AuthType.none)
const fields = computed(() => {
  const identity = IDENTITY_FIELDS[authType.value].map((name) => ({ name, secret: false }))
  const secrets = SECRET_FIELDS[authType.value].map((name) => ({ name, secret: true }))
  const firstSecret = secrets[0]?.name
  return [...identity, ...secrets].map((field) => ({
    ...field,
    label: LABELS[field.name](),
    optional: field.name === 'sessionToken',
    autofocus: field.name === firstSecret
  }))
})

const values = ref<AuthFields>(cluster.value ? pickFields(cluster.value.auth, IDENTITY_FIELDS[authType.value]) : {})
const visible = ref(false)
const loading = ref(false)
const errorMessage = ref('')

const required = (val: string) => !!val || 'required'

const login = async () => {
  if (!cluster.value) return

  const id = cluster.value.id
  const entered = Object.fromEntries(fields.value.map(({ name }) => [name, values.value[name] || '']))
  loading.value = true
  errorMessage.value = ''

  try {
    await new ElasticsearchAdapter({ ...cluster.value, auth: withFields(cluster.value.auth, entered) }).test()
  } catch (e: any) {
    errorMessage.value = e.status ? `${e.status} ${e.statusText ?? ''}`.trim() : e.message || t('setup.cluster_credentials.error')
    return
  } finally {
    loading.value = false
  }

  credentials.set(id, pickFields(withFields(cluster.value.auth, entered), Object.keys(entered)))
  session.reconnect()
}
</script>
