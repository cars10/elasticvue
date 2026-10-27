<template>
  <div class="row q-col-gutter-md">
    <custom-input
      v-model="cluster.name"
      :rules="[required]"
      :label="t('setup.test_and_connect.form.name.label')"
      autocomplete="off"
      outlined
      data-testid="cluster-edit-name"
      autofocus
      class="col-12"
    />

    <custom-input
      v-model="cluster.uri"
      name="uri"
      :rules="[validateUri, required]"
      outlined
      :label="t('setup.test_and_connect.form.uri.label')"
      class="col-12"
    >
      <template v-if="buildConfig.hints.ssl && ssl" #hint>
        {{ t('shared.ssl_hint.hint') }}
        <a
          href="https://github.com/cars10/elasticvue/blob/master/docs/access-clusters-using-ssl.md"
          rel="nofollow"
          target="_blank"
          class="q-ml-xs"
        >
          {{ t('shared.ssl_hint.help') }}
        </a>
      </template>
      <template #append>
        <q-icon name="close" class="cursor-pointer" @click="resetUri" />
      </template>
    </custom-input>

    <q-option-group v-model="cluster.auth.authType" inline :options="authorizationTypes" color="primary" class="col-12" />

    <template v-if="cluster.auth.authType === AuthType.basicAuth">
      <custom-input
        v-model="cluster.auth.authData.username"
        outlined
        :rules="[required]"
        :label="t('setup.test_and_connect.form.username.label')"
        autocomplete="off"
        class="col-12 col-sm-6"
      />
      <custom-input
        v-model="cluster.auth.authData.password"
        autocomplete="off"
        outlined
        :rules="[required]"
        :label="t('setup.test_and_connect.form.password.label')"
        :type="passwordVisible ? 'text' : 'password'"
        class="col-12 col-sm-6"
      >
        <template #append>
          <q-icon
            :name="passwordVisible ? 'visibility' : 'visibility_off'"
            class="cursor-pointer"
            @click="passwordVisible = !passwordVisible"
          />
        </template>
      </custom-input>
    </template>

    <custom-input
      v-if="cluster.auth.authType === AuthType.apiKey"
      v-model="cluster.auth.authData.apiKey"
      autocomplete="off"
      outlined
      :rules="[required]"
      :label="t('setup.test_and_connect.form.api_key.label')"
      :type="passwordVisible ? 'text' : 'password'"
      class="col-12"
    >
      <template #append>
        <q-icon
          :name="passwordVisible ? 'visibility' : 'visibility_off'"
          class="cursor-pointer"
          @click="passwordVisible = !passwordVisible"
        />
      </template>
    </custom-input>

    <template v-if="cluster.auth.authType === AuthType.awsIAM">
      <custom-input
        v-model="cluster.auth.authData.accessKeyId"
        autocomplete="off"
        outlined
        :rules="[required]"
        :label="t('setup.test_and_connect.form.access_key_id.label')"
        class="col-12 col-sm-6"
      />
      <custom-input
        v-model="cluster.auth.authData.secretAccessKey"
        autocomplete="off"
        outlined
        :rules="[required]"
        :label="t('setup.test_and_connect.form.secret_access_key.label')"
        class="col-12 col-sm-6"
      />
      <custom-input
        v-model="cluster.auth.authData.region"
        autocomplete="off"
        outlined
        :rules="[required]"
        :label="t('setup.test_and_connect.form.region.label')"
        class="col-12 col-sm-6"
      />
      <custom-input
        v-model="cluster.auth.authData.sessionToken"
        autocomplete="off"
        outlined
        :label="t('setup.test_and_connect.form.session_token.label')"
        class="col-12 col-sm-6"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTranslation } from '../../composables/i18n.ts'
import { DEFAULT_CLUSTER_URI } from '../../consts.ts'
import { AuthType, ElasticsearchClusterConnection } from '../../store/connection.ts'
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

const passwordVisible = ref(false)
const t = useTranslation()
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
</script>
