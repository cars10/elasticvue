<template>
  <q-form ref="form" greedy @submit.prevent="testConnection">
    <q-card-section>
      <div v-if="buildConfig.hints.cors && !corsError" class="q-mb-md">
        <div class="row items-center no-wrap text-muted">
          <q-icon name="info_outline" size="xs" class="q-mr-sm" />
          <span class="col">{{ t('setup.configure.introduction') }}</span>
          <q-btn
            flat
            dense
            no-caps
            color="primary"
            :label="showHelp ? t('setup.configure.hide_help') : t('setup.configure.show_help')"
            @click="showHelp = !showHelp"
          />
        </div>
        <q-slide-transition>
          <configure-help v-show="showHelp" class="q-mt-sm" />
        </q-slide-transition>
      </div>

      <cluster-form-fields v-model="cluster" />

      <cluster-connection-errors
        v-if="testState.error || connectState.error"
        :cluster="cluster"
        :error-message="testState.errorMessage || connectState.errorMessage"
        :cors="corsError"
      />
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
        id="connect"
        :label="t('setup.test_and_connect.form.connect')"
        :loading="connectState.loading"
        unelevated
        color="primary-dark"
        @click="connectAndRedirect"
      />
    </q-card-actions>
  </q-form>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useClusterConnection } from '../../composables/ClusterConnection'
import ClusterFormFields from './ClusterFormFields.vue'
import ClusterConnectionErrors from './ClusterConnectionErrors.vue'
import ConfigureHelp from './ConfigureHelp.vue'
import { buildConfig } from '../../buildConfig.ts'
import { useTranslation } from '../../composables/i18n.ts'
import { ElasticsearchClusterConnection } from '../../store/connection.ts'

const props = defineProps<{ modelValue: ElasticsearchClusterConnection; connectCallback: (id: string) => void }>()
const cluster = ref(props.modelValue)
const t = useTranslation()

const emit = defineEmits(['update:modelValue'])
watch(cluster, (value) => emit('update:modelValue', value))

const { testState, connectState, testConnection, connectAndRedirect } = useClusterConnection(cluster, props.connectCallback)
const showHelp = ref(false)
const corsError = computed(() => (testState.value.error ? testState.value.cors : connectState.value.cors))
</script>
