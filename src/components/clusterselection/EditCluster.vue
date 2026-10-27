<template>
  <q-btn
    icon="edit"
    round
    flat
    size="sm"
    data-testid="cluster-edit"
    :title="t('cluster_selection.edit_cluster.edit.title')"
    @click.stop="dialog = true"
  />

  <q-dialog v-model="dialog" transition-duration="100">
    <q-card style="width: 640px; max-width: 90vw">
      <q-card-section class="row items-center no-wrap">
        <h2 class="text-h6 q-my-none col">{{ t('cluster_selection.edit_cluster.heading') }}</h2>
        <q-btn v-close-popup icon="close" flat round dense :aria-label="t('defaults.close')" />
      </q-card-section>

      <q-separator />

      <q-form ref="form" greedy @submit.prevent="testConnection">
        <q-card-section>
          <cluster-form-fields v-model="cluster" />
          <cluster-connection-errors v-if="testState.error" :cluster="cluster" :error-message="testState.errorMessage" />
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-md">
          <q-btn v-close-popup flat :label="t('defaults.close')" />
          <q-btn
            :label="t('setup.test_and_connect.form.test_connection')"
            :loading="testState.loading"
            outline
            color="primary"
            type="submit"
          />
          <q-btn
            :label="t('defaults.update')"
            unelevated
            color="primary-dark"
            data-testid="cluster-edit-save"
            @click="saveCluster"
          />
        </q-card-actions>
      </q-form>
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

const { dialog, cluster, saveCluster, testConnection, testState } = useEditCluster(props)
</script>
