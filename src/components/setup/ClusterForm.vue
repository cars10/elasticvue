<template>
  <form @submit.prevent="testConnection">
    <cluster-form-fields v-model="cluster" v-model:formValid="formValid" />

    <q-btn :label="$t('setup.test_and_connect.form.test_connection')"
           :disable="!formValid"
           :loading="testRequestState.loading"
           color="primary-dark"
           class="q-mr-md"
           type="submit" />

    <q-btn :label="$t('setup.test_and_connect.form.connect')"
           :disable="!formValid"
           color="primary-dark"
           type="button"
           class="q-mr-md"
           @click="connectAndRedirect" />

    <q-btn v-close-popup flat :label="$t('defaults.close')" />

    <slot name="actions" />

    <cluster-connection-errors v-if="testRequestState.error || connectRequestState.error"
                               :uri="cluster.uri"
                               :error-message="testRequestState.errorMessage" />
  </form>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'
  import { useClusterConnection } from '../../composables/ClusterConnection'
  import ClusterFormFields from './ClusterFormFields.vue'
  import ClusterConnectionErrors from './ClusterConnectionErrors.vue'

  const props = defineProps<{ modelValue: object, connectCallback: any }>()
  const cluster = ref(props.modelValue)

  const formValid = ref(true)

  const connectAndRedirect = () => {
    console.log(formValid.value)
    if (!formValid.value) return

    connect().then(idx => props.connectCallback(idx))
  }
  const emit = defineEmits(['update:modelValue'])
  watch(cluster, value => emit('update:modelValue', value))

  const {
    testRequestState,
    connectRequestState,
    testConnection,
    connect
  } = useClusterConnection({ cluster })
</script>