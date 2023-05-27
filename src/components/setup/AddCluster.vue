<template>
  <div v-if="SHOW_CORS_HINT" class="q-mb-md">
    <p class="q-mb-sm">Configuration checklist</p>

    <div>
      <q-checkbox v-model="config.auth" class="q-my-sm">
        Authorization: {{ $t('shared.authorization_header_hint') }}
      </q-checkbox>

      <q-checkbox v-model="config.ssl" class="q-my-sm">
        SSL:
        {{ $t('shared.ssl_hint.hint') }}
        <a aria-label="SSL Configuration help"
           href="https://github.com/cars10/elasticvue/wiki/Access-clusters-using-SSL"
           rel="nofollow"
           target="_blank">
          {{ $t('shared.ssl_hint.help') }}
        </a>
      </q-checkbox>
    </div>
  </div>

  <form @submit.prevent="testConnection">
    <div class="q-mb-md">
      <div class="q-mb-md">
        <q-input v-model="newCluster.name"
                 required
                 label="Cluster name"
                 autocomplete="off"
                 outlined
                 autofocus />
      </div>

      <div class="row q-mb-md">
        <div class="col-md-6 col-12 q-pr-sm">
          <q-input v-model="newCluster.username"
                   outlined
                   :label="$t('setup.test_and_connect.form.username.label')"
                   autocomplete="off" />
        </div>

        <div class="col-md-6 col-12 q-pl-sm">
          <q-input v-model="newCluster.password"
                   autocomplete="off"
                   outlined
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

      <q-input v-model="newCluster.uri"
               :rules="[validUri]"
               required
               outlined
               :label="$t('setup.test_and_connect.form.uri.label')"
               @keyup.ctrl.enter="connectAndRedirect">
        <template #append>
          <q-icon name="close" class="cursor-pointer" @click="resetCluster" />
        </template>
      </q-input>
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
  import { useClusterConnection } from '../../composables/ClusterConnection'
  import { useSnackbar } from '../../composables/Snackbar'
  import { useTranslation } from '../../composables/i18n'
  import { SHOW_CORS_HINT } from '../../consts'

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

  const config = ref({ ssl: false, auth: false })

  const {
    newCluster,
    testRequestState,
    connectRequestState,
    testConnection,
    validUri,
    resetCluster,
    formValid,
    connect
  } = useClusterConnection()
</script>