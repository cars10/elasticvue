<template>
  <div class="q-mb-md">
    <div class="q-mb-md">
      <q-option-group v-model="cluster.auth.authType" inline :options="authorizationTypes" color="primary" />
    </div>

    <div class="q-mb-md">
      <custom-input
        v-model="cluster.name"
        :rules="[required]"
        :label="t('setup.test_and_connect.form.name.label')"
        autocomplete="off"
        outlined
        data-testid="cluster-edit-name"
        autofocus
      />
    </div>

    <div v-if="cluster.auth.authType === AuthType.basicAuth || cluster.auth.authType === AuthType.apiKey" class="row q-mb-md">
      <div v-if="cluster.auth.authType === AuthType.basicAuth" class="col q-pr-md">
        <custom-input
          v-model="cluster.auth.authData.username"
          outlined
          :rules="[required]"
          :label="t('setup.test_and_connect.form.username.label')"
          autocomplete="off"
        />
      </div>

      <div v-if="cluster.auth.authType === AuthType.basicAuth" class="col">
        <custom-input
          v-model="cluster.auth.authData.password"
          autocomplete="off"
          outlined
          :rules="[required]"
          :label="t('setup.test_and_connect.form.password.label')"
          :type="passwordVisible ? 'text' : 'password'"
        >
          <template #append>
            <q-icon
              :name="passwordVisible ? 'visibility' : 'visibility_off'"
              class="cursor-pointer"
              @click="passwordVisible = !passwordVisible"
            />
          </template>
        </custom-input>
      </div>

      <div v-if="cluster.auth.authType === AuthType.apiKey" class="col">
        <custom-input
          v-model="cluster.auth.authData.apiKey"
          autocomplete="off"
          outlined
          :rules="[required]"
          :label="t('setup.test_and_connect.form.api_key.label')"
          :type="passwordVisible ? 'text' : 'password'"
        >
          <template #append>
            <q-icon
              :name="passwordVisible ? 'visibility' : 'visibility_off'"
              class="cursor-pointer"
              @click="passwordVisible = !passwordVisible"
            />
          </template>
        </custom-input>
      </div>
    </div>

    <div v-if="cluster.auth.authType === AuthType.awsIAM">
      <q-select
        v-model="awsCredentialType"
        :options="awsCredentialTypeOptions"
        :label="t('setup.test_and_connect.form.aws_credential_type.label')"
        emit-value
        map-options
        outlined
        options-dense
        class="q-mb-md"
        data-testid="aws-credential-type"
      />
      <template v-if="isAwsBasic && awsBasicAuthData">
        <custom-input
          v-model="awsBasicAuthData.accessKeyId"
          autocomplete="off"
          outlined
          :rules="[required]"
          :label="t('setup.test_and_connect.form.access_key_id.label')"
          class="q-mb-md"
        />
        <custom-input
          v-model="awsBasicAuthData.secretAccessKey"
          autocomplete="off"
          outlined
          :rules="[required]"
          :label="t('setup.test_and_connect.form.secret_access_key.label')"
          class="q-mb-md"
        />
        <custom-input
          v-model="awsBasicAuthData.region"
          autocomplete="off"
          outlined
          :rules="[required]"
          :label="t('setup.test_and_connect.form.region.label')"
          class="q-mb-md"
        />
        <custom-input
          v-model="awsBasicAuthData.sessionToken"
          autocomplete="off"
          outlined
          :label="t('setup.test_and_connect.form.session_token.label')"
          class="q-mb-md"
        />
      </template>
      <template v-else-if="isAwsProfile && awsProfileAuthData">
        <custom-input
          v-model="awsProfileAuthData.profileName"
          autocomplete="off"
          outlined
          :rules="[required]"
          :label="t('setup.test_and_connect.form.profile_name.label')"
          class="q-mb-md"
        />
        <custom-input
          v-model="awsProfileAuthData.region"
          autocomplete="off"
          outlined
          :label="t('setup.test_and_connect.form.region_optional.label')"
          class="q-mb-md"
        />
      </template>
    </div>

    <custom-input
      v-model="cluster.uri"
      name="uri"
      :rules="[validateUri, required]"
      outlined
      :label="t('setup.test_and_connect.form.uri.label')"
    >
      <template #append>
        <q-icon name="close" class="cursor-pointer" @click="resetUri" />
      </template>
    </custom-input>
    <div v-if="buildConfig.hints.ssl" :class="{ 'text-muted': !ssl, 'text-bold': ssl }">
      {{ t('shared.ssl_hint.hint') }}
      <a
        aria-label="SSL Configuration help"
        href="https://github.com/cars10/elasticvue/wiki/Access-clusters-using-SSL"
        rel="nofollow"
        target="_blank"
        class="q-ml-sm"
      >
        {{ t('shared.ssl_hint.help') }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'
import { DEFAULT_CLUSTER_URI } from '../../consts.ts'
import { AuthType, ElasticsearchClusterConnection, getAwsCredentialType, type AwsCredentialType } from '../../store/connection.ts'
import { buildConfig } from '../../buildConfig.ts'
import CustomInput from '../shared/CustomInput.vue'

const props = defineProps<{ modelValue: ElasticsearchClusterConnection }>()

const authorizationTypes = [
  { value: AuthType.none, label: 'No authorization' },
  { value: AuthType.basicAuth, label: 'Basic auth' },
  { value: AuthType.apiKey, label: 'API key' },
  { value: AuthType.awsIAM, label: 'AWS IAM' }
]

const cluster = ref(props.modelValue)
const t = useTranslation()

const awsCredentialTypeOptions = computed<{ value: AwsCredentialType; label: string }[]>(() => [
  { value: 'basic', label: t('setup.test_and_connect.form.aws_credential_type.basic') },
  { value: 'profile', label: t('setup.test_and_connect.form.aws_credential_type.profile') }
])

const isAwsBasic = computed(() => {
  if (cluster.value.auth.authType !== AuthType.awsIAM) return false
  return getAwsCredentialType(cluster.value.auth) !== 'profile'
})

const isAwsProfile = computed(() => getAwsCredentialType(cluster.value.auth) === 'profile')

const awsBasicAuthData = computed(() => {
  if (cluster.value.auth.authType !== AuthType.awsIAM) return null
  const d = cluster.value.auth.authData as {
    awsCredentialType?: string
    accessKeyId?: string
    secretAccessKey?: string
    sessionToken?: string
    region?: string
  }
  return 'accessKeyId' in d && d.accessKeyId !== undefined
    ? (d as { accessKeyId: string; secretAccessKey: string; sessionToken?: string; region: string })
    : null
})

const awsProfileAuthData = computed(() => {
  if (cluster.value.auth.authType !== AuthType.awsIAM) return null
  const d = cluster.value.auth.authData as { awsCredentialType?: string; profileName?: string; region?: string }
  return 'profileName' in d && d.profileName !== undefined ? (d as { profileName: string; region?: string }) : null
})

const awsCredentialType = computed({
  get(): AwsCredentialType {
    return getAwsCredentialType(cluster.value.auth) ?? 'basic'
  },
  set(value: AwsCredentialType) {
    if (cluster.value.auth.authType !== AuthType.awsIAM) return
    const prev = cluster.value.auth.authData as Record<string, unknown>
    if (value === 'basic') {
      cluster.value.auth.authData = {
        awsCredentialType: 'basic',
        accessKeyId: (prev.accessKeyId as string) ?? '',
        secretAccessKey: (prev.secretAccessKey as string) ?? '',
        sessionToken: (prev.sessionToken as string) ?? '',
        region: (prev.region as string) ?? ''
      }
    } else {
      cluster.value.auth.authData = {
        awsCredentialType: 'profile',
        profileName: (prev.profileName as string) ?? 'default',
        region: (prev.region as string) ?? ''
      }
    }
  }
})

const passwordVisible = ref(false)
const validateUri = (uri: string) => {
  try {
    new URL(uri)
    if (/^https?:\/\/.*/.test(uri)) {
      return true
    }
  } catch (_e) {
    return 'Invalid uri'
  }
  return false
}

const required = (val: string) => !!val || 'required'

const resetUri = () => (cluster.value.uri = DEFAULT_CLUSTER_URI)
const ssl = computed(() => /^https/.test(cluster.value.uri))

const emit = defineEmits(['update:modelValue', 'update:formValid'])
watch(cluster, (value) => emit('update:modelValue', value))

// When switching to AWS IAM, ensure authData has the correct shape (basic by default)
watch(
  () => cluster.value.auth.authType,
  (authType, prevType) => {
    if (authType === AuthType.awsIAM && prevType !== AuthType.awsIAM) {
      const data = cluster.value.auth.authData as Record<string, unknown>
      if (!('accessKeyId' in data) && !('profileName' in data)) {
        cluster.value.auth.authData = {
          awsCredentialType: 'basic',
          accessKeyId: '',
          secretAccessKey: '',
          sessionToken: '',
          region: ''
        }
      }
    }
  }
)
</script>
