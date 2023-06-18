<template>
  <q-btn icon="edit" round flat size="sm" data-testid="cluster-edit"
         :title="t('cluster_selection.edit_cluster.edit.title')"
         @click.stop="dialog = true" />

  <q-dialog v-model="dialog">
    <q-card style="min-width: 800px">
      <q-card-section class="flex justify-between">
        <h2 class="text-h6 q-my-none">
          {{ t('cluster_selection.edit_cluster.heading') }}
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
                 data-testid="cluster-edit-save"
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
  import ClusterFormFields from '../setup/ClusterFormFields.vue'
  import ClusterConnectionErrors from '../setup/ClusterConnectionErrors.vue'
  import { useTranslation } from '../../composables/i18n.ts'
  import { EditClusterProps, useEditCluster } from '../../composables/components/clusterselection/EditCluster.ts'

  const t = useTranslation()
  const props = defineProps<EditClusterProps>()

  const {
    dialog,
    cluster,
    formValid,
    saveCluster,
    testConnection,
    testRequestState
  } = useEditCluster(props)
</script>
