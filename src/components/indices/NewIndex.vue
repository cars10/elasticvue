<template>
  <q-btn id="new_index" color="primary-dark" :label="$t('indices.new_index.heading')" @click="dialog = true" />

  <q-dialog v-model="dialog" @hide="resetForm">
    <q-card style="width: 500px">
      <q-card-section class="flex justify-between">
        <h2 class="text-h6 q-my-none">
          {{ $t('indices.new_index.heading') }}
        </h2>
        <q-btn v-close-popup icon="close" flat round dense />
      </q-card-section>

      <q-separator />

      <q-form @submit="createIndex">
        <q-card-section>
          <q-input v-model="indexName"
                   :label="$t('indices.new_index.form.index_name.label')"
                   class="q-mb-sm"
                   lazy-rules
                   autocomplete="off"
                   autofocus
                   required
                   :rules="[nameValidation]" />

          <q-input v-model="indexShards"
                   :label="$t('indices.new_index.form.shards.label')"
                   class="q-mb-sm"
                   lazy-rules
                   autocomplete="off"
                   type="number" />

          <q-input v-model="indexReplicas"
                   :label="$t('indices.new_index.form.replicas.label')"
                   class="q-mb-sm"
                   lazy-rules
                   autocomplete="off"
                   type="number" />
        </q-card-section>

        <q-card-section>
          <q-btn id="create_index"
                 :disable="requestState.loading || !formValid"
                 :loading="requestState.loading"
                 :label="$t('defaults.create')"
                 color="positive"
                 type="submit"
                 class="q-mr-md" />
          <q-btn v-close-popup flat :label="$t('defaults.close')" />
        </q-card-section>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
  import { computed, ref } from 'vue'
  import { useTranslation } from '../../composables/i18n'
  import { useElasticsearchAdapter } from '../../composables/CallElasticsearch'
  import { useSnackbar } from '../../composables/Snackbar'

  const t = useTranslation()

  const dialog = ref(false)
  const indexName = ref('')
  const indexShards = ref(1)
  const indexReplicas = ref(1)

  const nameValidation = () => {
    return !!indexName.value || t('defaults.required')
  }

  const formValid = computed(() => (nameValidation() === true))
  const { showSnackbar } = useSnackbar()

  const { requestState, callElasticsearch } = useElasticsearchAdapter()

  const resetForm = () => {
    indexName.value = ''
    indexShards.value = 1
    indexReplicas.value = 1
  }

  const closeDialog = () => {
    resetForm()
    dialog.value = false
  }

  const emit = defineEmits(['reload'])

  const createIndex = () => {
    const params = {
      index: indexName.value,
      body: { settings: { number_of_shards: indexShards.value || 1, number_of_replicas: indexReplicas.value || 1 } }
    }

    callElasticsearch('indexCreate', params)
        .then(body => {
          emit('reload')
          showSnackbar(requestState.value, {
            title: t('indices.new_index.create_index.growl', { index: indexName.value }),
            body: JSON.stringify(body)
          })
          closeDialog()
        })
        .catch(() => showSnackbar(requestState.value))
  }
</script>
