<template>
  <form @submit.prevent="testConnection">
    <div class="q-mb-md">
      <div class="q-mb-md">
        <q-input v-model="newCluster.name"
                 required
                 label="Cluster name"
                 autocomplete="off"
                 autofocus />
      </div>

      <div class="row q-mb-md">
        <div class="col-md-6 col-12 q-pr-sm">
          <q-input v-model="newCluster.username"
                   :label="$t('setup.test_and_connect.form.username.label')"
                   autocomplete="off" />
        </div>

        <div class="col-md-6 col-12 q-pl-sm">
          <q-input v-model="newCluster.password"
                   autocomplete="off"
                   :label="$t('setup.test_and_connect.form.password.label')"
                   :type="passwordVisible ? 'text' : 'password'">
            <template #append>
              <q-icon :name="passwordVisible ? 'visibility' : 'visibility_off'"
                      class="cursor-pointer"
                      @click="passwordVisible = !passwordVisible" />
            </template>
          </q-input>
        </div>
      </div>

      <authorization-header-hint v-if="SHOW_CORS_HINT && newCluster.username" />

      <q-input v-model="newCluster.uri"
               :rules="[validUri]"
               required
               :label="$t('setup.test_and_connect.form.uri.label')"
               @keyup.ctrl.enter="connectAndRedirect">
        <template #append>
          <q-icon name="close" class="cursor-pointer" @click="resetCluster" />
        </template>
      </q-input>

      <ssl-hint v-if="clusterHostSSL" />
    </div>

    <q-btn :label="$t('setup.test_and_connect.form.test_connection')"
           :disable="!formValid"
           :loading="testRequestState.loading"
           color="primary-dark"
           class="q-mr-sm"
           type="submit" />

    <q-btn :label="$t('setup.test_and_connect.form.connect')"
           :disable="!formValid"
           color="primary-dark"
           type="button"
           @click="connectAndRedirect" />

    <slot name="actions" />

    <q-banner v-if="testRequestState.error || connectRequestState.error" class="text-white bg-negative q-mt-lg q-py-md">
      <template #avatar>
        <q-icon name="error" />
      </template>
      {{ $t('setup.test_and_connect.error.heading') }}
      <ol class="q-pl-lg q-my-sm">
        <li>
          {{ $t('setup.test_and_connect.error.cluster_reachable') }}
          <a :href="newCluster.uri" target="_blank">{{ newCluster.uri }}</a>
        </li>
        <li>
          {{ $t('setup.test_and_connect.error.correct_settings') }} <strong>elasticsearch.yml</strong>
          {{ $t('setup.test_and_connect.error.cluster_restarted') }}
        </li>
      </ol>

      <div class="q-mt-sm">
        {{ testRequestState.errorMessage }}
      </div>
    </q-banner>
  </form>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import AuthorizationHeaderHint from './AuthorizationHeaderHint.vue'
  import SslHint from './SslHint.vue'
  import { SHOW_CORS_HINT } from '../../consts'
  import { useClusterConnection } from '../../composables/ClusterConnection'
  import { useSnackbar } from '../../composables/Snackbar'
  import { useTranslation } from '../../composables/i18n'

  const t = useTranslation()
  const { showSuccessSnackbar } = useSnackbar()
  const router = useRouter()

  const passwordVisible = ref(false)
  const connectAndRedirect = () => {
    if (!formValid.value) return

    connect().then(idx => {
      showSuccessSnackbar({ title: t('setup.test_and_connect.connected') })
      router.push({ name: 'home', params: { clusterIndex: idx.toString() } })
    })
  }

  const {
    newCluster,
    testRequestState,
    connectRequestState,
    testConnection,
    validUri,
    resetCluster,
    formValid,
    clusterHostSSL,
    connect
  } = useClusterConnection()
</script>