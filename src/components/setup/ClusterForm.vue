<template>
  <q-form @submit.prevent="testConnection" ref="form" greedy>
    <cluster-form-fields v-model="cluster" />

    <q-separator class="q-my-lg" />

    <q-btn
      :label="t('setup.test_and_connect.form.test_connection')"
      :disable="!formValid"
      :loading="testState.loading"
      color="primary-dark"
      class="q-mr-md"
      type="submit"
    />

    <q-btn
      id="connect"
      :label="t('setup.test_and_connect.form.connect')"
      :disable="!formValid"
      :loading="connectState.loading"
      color="primary-dark"
      type="button"
      class="q-mr-md"
      @click="connectAndRedirect"
    />

    <q-btn v-close-popup flat :label="t('defaults.close')" />

    <slot name="actions" />

    <cluster-connection-errors
      v-if="testState.error || connectState.error"
      :cluster="cluster"
      :error-message="testState.errorMessage || connectState.errorMessage"
    />
  </q-form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useClusterConnection } from '../../composables/ClusterConnection'
import ClusterFormFields from './ClusterFormFields.vue'
import ClusterConnectionErrors from './ClusterConnectionErrors.vue'
import { useTranslation } from '../../composables/i18n.ts'
import { ElasticsearchClusterConnection } from '../../store/connection.ts'

const props = defineProps<{ modelValue: ElasticsearchClusterConnection; connectCallback: (idx: number) => void }>()
const cluster = ref(props.modelValue)
const t = useTranslation()

const emit = defineEmits(['update:modelValue'])
watch(cluster, (value) => emit('update:modelValue', value))

const { testState, connectState, testConnection, connectAndRedirect, form, formValid } = useClusterConnection(
  cluster,
  props.connectCallback
)
</script>
