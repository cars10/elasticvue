<template>
  <q-btn icon="edit" round flat size="sm" @click.stop="dialog = true" />

  <q-dialog v-model="dialog">
    <q-card style="min-width: 800px">
      <q-card-section class="flex justify-between">
        <h2 class="text-h6 q-my-none">
          {{ t('elasticsearch_instance.rename_instance.heading') }}
        </h2>

        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <form @submit.prevent>
          <cluster-form-fields v-model="cluster" v-model:formValid="formValid" />

          <q-btn :label="t('setup.test_and_connect.form.test_connection')"
                 :disable="!formValid"
                 :loading="testRequestState.loading"
                 color="primary-dark"
                 class="q-mr-md"
                 type="submit"
                 @click="testConnection" />

          <q-btn :label="'Save'"
                 color="primary-dark"
                 type="button"
                 class="q-mr-md"
                 @click="saveCluster" />

          <q-btn v-close-popup flat :label="t('defaults.close')" />

          <cluster-connection-errors v-if="testRequestState.error"
                                     :uri="cluster.uri"
                                     :error-message="testRequestState.errorMessage" />
        </form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  import { Ref, ref, toRaw, watch } from 'vue'
  import { ElasticsearchCluster, useConnectionStore } from '../../store/connection'
  import ClusterFormFields from '../setup/ClusterFormFields.vue'
  import ClusterConnectionErrors from '../setup/ClusterConnectionErrors.vue'
  import { useClusterConnection } from '../../composables/ClusterConnection'
  import { useSnackbar } from '../../composables/Snackbar'
  import { useTranslation } from '../../composables/i18n.ts'

  const { showSuccessSnackbar } = useSnackbar()
  const t = useTranslation()

  const props = defineProps<{ index: number }>()
  const connectionStore = useConnectionStore()

  const cluster: Ref<ElasticsearchCluster> = ref(Object.assign({}, toRaw(connectionStore.clusters[props.index])))
  const getCluster = (index: number) => (cluster.value = Object.assign({}, toRaw(connectionStore.clusters[index])))
  watch(() => props.index, getCluster)

  const formValid = ref(true)

  const dialog = ref(false)
  const saveCluster = () => {
    showSuccessSnackbar({ title: 'Cluster saved' })
    connectionStore.updateCluster({ cluster: cluster.value, index: props.index })
    dialog.value = false
  }

  watch([() => cluster.value.username, () => cluster.value.password, () => cluster.value.uri], () => {
    testRequestState.value = { success: false, error: false, loading: false, errorMessage: '' }
  })
  const { testRequestState, testConnection } = useClusterConnection({ cluster })
</script>
