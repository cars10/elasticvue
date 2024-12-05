<template>
  <div class="q-mb-md">
    <div class="q-mb-md">
      <q-option-group v-model="authorizationType"
                      inline
                      :options="authorizationTypes"
                      color="primary" />
    </div>

    <div class="q-mb-md">
      <q-input v-model="cluster.name"
               required
               :label="t('setup.test_and_connect.form.name.label')"
               autocomplete="off"
               outlined
               data-testid="cluster-edit-name"
               autofocus />
    </div>

    <div v-if="['basic', 'api'].includes(authorizationType)" class="row q-mb-md">
      <div v-if="authorizationType === 'basic'" class="col q-pr-md">
        <q-input v-model="cluster.username"
                 outlined
                 :label="t('setup.test_and_connect.form.username.label')"
                 autocomplete="off" />
      </div>

      <div class="col">
        <q-input v-model="cluster.password"
                 autocomplete="off"
                 outlined
                 :label="authorizationType === 'basic' ? t('setup.test_and_connect.form.password.label') : t('setup.test_and_connect.form.api_key.label')"
                 :type="passwordVisible ? 'text' : 'password'">
          <template #append>
            <q-icon :name="passwordVisible ? 'visibility' : 'visibility_off'"
                    class="cursor-pointer"
                    @click="passwordVisible = !passwordVisible" />
          </template>
        </q-input>
      </div>
    </div>

    <q-input v-model="cluster.uri"
             name="uri"
             :rules="[validateUri]"
             required
             outlined
             :label="t('setup.test_and_connect.form.uri.label')">
      <template #append>
        <q-icon name="close" class="cursor-pointer" @click="resetUri" />
      </template>
    </q-input>

    <div v-if="buildConfig.hints.ssl" :class="{'text-muted': !ssl, 'text-bold': ssl}">
      {{ t('shared.ssl_hint.hint') }}
      <a aria-label="SSL Configuration help"
         href="https://github.com/cars10/elasticvue/wiki/Access-clusters-using-SSL"
         rel="nofollow"
         target="_blank"
         class="q-ml-sm">
        {{ t('shared.ssl_hint.help') }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, Ref, ref, watch } from 'vue'
  import { useTranslation } from '../../composables/i18n.ts'
  import { DEFAULT_CLUSTER_URI } from '../../consts.ts'
  import { ElasticsearchCluster } from '../../store/connection.ts'
  import { buildConfig } from '../../buildConfig.ts'

  const props = defineProps<{ modelValue: ElasticsearchCluster, formValid: boolean }>()

  const authorizationType = ref('')
  if (props.modelValue.username.length > 0 && props.modelValue.password.length > 0) authorizationType.value = 'basic'
  if (props.modelValue.username.length === 0 && props.modelValue.password.length > 0) authorizationType.value = 'api'

  const authorizationTypes = [
    { value: '', label: 'No authorization' },
    { value: 'basic', label: 'Basic auth' },
    { value: 'api', label: 'API key' },
  ]

  const cluster: Ref<ElasticsearchCluster> = ref(props.modelValue)
  const passwordVisible = ref(false)
  const t = useTranslation()
  const validateUri = (uri: string) => {
    try {
      new URL(uri)
      if (/^https?:\/\/.*/.test(uri)) {
        emit('update:formValid', true)
        return true
      }
    } catch (_e) {
      emit('update:formValid', false)
      return 'Invalid uri'
    }
    return false
  }

  const resetUri = () => (cluster.value.uri = DEFAULT_CLUSTER_URI)
  const ssl = computed(() => (/^https/.test(cluster.value.uri)))

  const emit = defineEmits(['update:modelValue', 'update:formValid'])
  watch(cluster, value => emit('update:modelValue', value))
</script>