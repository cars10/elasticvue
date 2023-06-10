<template>
  <div v-if="SHOW_CORS_HINT" class="q-mb-md">
    <p class="q-mb-sm">Configuration checklist</p>

    <div>
      <q-checkbox v-model="config.auth">
        Authorization: {{ t('shared.authorization_header_hint') }}
      </q-checkbox>

      <q-checkbox v-model="config.ssl">
        SSL:
        {{ t('shared.ssl_hint.hint') }}
      </q-checkbox>
      <a aria-label="SSL Configuration help"
         href="https://github.com/cars10/elasticvue/wiki/Access-clusters-using-SSL"
         rel="nofollow"
         target="_blank"
         class="q-ml-sm">
        {{ t('shared.ssl_hint.help') }}
      </a>
    </div>
  </div>

  <cluster-form v-model="newCluster" :connect-callback="connectCallback" />
</template>

<script setup>
  import { ref } from 'vue'
  import { DEFAULT_CLUSTER_NAME, DEFAULT_CLUSTER_URI, SHOW_CORS_HINT } from '../../consts'
  import ClusterForm from './ClusterForm.vue'
  import { useSnackbar } from '../../composables/Snackbar'
  import { useRouter } from 'vue-router'
  import { useTranslation } from '../../composables/i18n'

  const t = useTranslation()
  const { showSuccessSnackbar } = useSnackbar()
  const router = useRouter()

  const newCluster = ref({
    name: DEFAULT_CLUSTER_NAME,
    username: '',
    password: '',
    uri: DEFAULT_CLUSTER_URI
  })
  const config = ref({ ssl: false, auth: false })

  const connectCallback = (idx) => {
    showSuccessSnackbar({ title: t('setup.test_and_connect.connected') })
    router.push({ name: 'home', params: { clusterIndex: idx.toString() } })
  }
</script>