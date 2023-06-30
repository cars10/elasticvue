<template>
  <form @submit.prevent="testConnection">
    <cluster-form-fields v-model="cluster" v-model:formValid="formValid" />

    <q-btn :label="t('setup.test_and_connect.form.test_connection')"
           :disable="!formValid"
           :loading="testState.loading"
           color="primary-dark"
           class="q-mr-md"
           type="submit" />

    <q-btn :label="t('setup.test_and_connect.form.connect')"
           :disable="!formValid"
           :loading="connectState.loading"
           color="primary-dark"
           type="button"
           class="q-mr-md"
           @click="connectAndRedirect" />

    <q-btn v-close-popup flat :label="t('defaults.close')" />

    <slot name="actions" />

    <cluster-connection-errors v-if="testState.error || connectState.error"
                               :uri="cluster.uri"
                               :error-message="testState.errorMessage || connectState.errorMessage" />
  </form>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useClusterConnection } from '../../composables/ClusterConnection'
  import ClusterFormFields from './ClusterFormFields.vue'
  import ClusterConnectionErrors from './ClusterConnectionErrors.vue'
  import { useTranslation } from '../../composables/i18n.ts'
  import { ElasticsearchCluster } from '../../store/connection.ts'

  const props = defineProps<{ modelValue: ElasticsearchCluster, connectCallback: any }>()
  const cluster = ref(props.modelValue)
  const t = useTranslation()
  const formValid = ref(true)

  const connectAndRedirect = () => {
    if (!formValid.value) return

    connect().then(idx => props.connectCallback(idx))
        .catch(() => {
        })
  }
  const emit = defineEmits(['update:modelValue'])
  watch(cluster, value => emit('update:modelValue', value))

  const {
    testState,
    connectState,
    testConnection,
    connect
  } = useClusterConnection(cluster)
</script>