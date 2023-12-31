<template>
  <cluster-form v-model="newCluster" :connect-callback="connectCallback" />
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import ClusterForm from './ClusterForm.vue'
  import { useSnackbar } from '../../composables/Snackbar'
  import { useTranslation } from '../../composables/i18n'
  import { reloadHomePage } from '../../helpers/router.ts'
  import { useRouter } from 'vue-router'
  import { newElasticsearchCluster } from '../../helpers/newCluster.ts'

  const t = useTranslation()
  const { showSuccessSnackbar } = useSnackbar()

  const newCluster = ref(newElasticsearchCluster())
  const router = useRouter()
  const connectCallback = (idx: number) => {
    showSuccessSnackbar({ title: t('setup.test_and_connect.connected') })
    reloadHomePage(router, idx)
  }
</script>