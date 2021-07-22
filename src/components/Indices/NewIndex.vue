<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{on}">
      <v-btn id="new_index" v-on="on" class="ml-0" color="primary-button">{{ $t('indices.new-index') }}</v-btn>
    </template>

    <v-card>
      <v-card-title>
        <h2 class="text-h5">{{ $t('indices.new-index') }}</h2>
        <div class="ml-a">
          <v-btn icon title="Close" @click.native="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <v-divider/>
      <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="createIndex">
        <v-card-text>
          <v-text-field v-if="dialog"
                        id="index_name"
                        v-model="indexName"
                        :rules="[nameValidation]"
                        autocomplete="off"
                        autofocus
                        :label="$t('indices.index-name')"
                        name="indexName"
                        required
                        @keyup.esc="closeDialog"/>

          <v-text-field id="index_shards"
                        v-model="indexShards"
                        autocomplete="off"
                        :label="$t('indices.number-of-shards')"
                        name="indexShards"
                        placeholder="1"
                        type="number"
                        @keyup.esc="closeDialog"/>

          <v-text-field id="index_replicas"
                        v-model="indexReplicas"
                        autocomplete="off"
                        :label="$t('indices.number-of-replicas')"
                        name="indexReplicas"
                        placeholder="1"
                        type="number"
                        @keyup.esc="closeDialog"/>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-btn id="create_index" :disabled="requestState.loading || !valid" :loading="requestState.loading"
                 color="success"
                 type="submit">{{ $t('indices.create') }}
          </v-btn>
          <v-btn text @click="closeDialog">{{ $t('indices.cancel') }}</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
  import { showErrorSnackbar, showSuccessSnackbar } from '@/mixins/ShowSnackbar'
  import { ref } from '@vue/composition-api'
  import { useElasticsearchRequest } from '@/mixins/RequestComposition'

  export default {
    name: 'new-index',
    setup (props, context) {
      const dialog = ref(false)
      const valid = ref(false)
      const indexName = ref('')
      const indexShards = ref('')
      const indexReplicas = ref('')

      const buildCreateParams = () => {
        return {
          index: indexName.value,
          body: {
            settings: {
              number_of_shards: indexShards.value || 1,
              number_of_replicas: indexReplicas.value || 1
            }
          }
        }
      }

      const nameValidation = () => {
        return !!indexName.value || 'Required'
      }

      const { requestState, callElasticsearch } = useElasticsearchRequest()
      const createIndex = () => {
        if (!context.refs.form.validate()) return

        callElasticsearch('indexCreate', buildCreateParams())
          .then(body => {
            context.emit('reloadIndices')
            showSuccessSnackbar({
              text: `The index '${indexName.value}' was successfully created.`,
              additionalText: JSON.stringify(body)
            })
            closeDialog()
          })
          .catch(() => showErrorSnackbar({ text: 'Error:', additionalText: requestState.value.apiErrorMessage }))
      }

      const closeDialog = () => {
        indexName.value = ''
        indexShards.value = ''
        indexReplicas.value = ''
        context.refs.form.resetValidation()
        dialog.value = false
      }

      return {
        dialog,
        valid,
        indexName,
        indexShards,
        indexReplicas,
        nameValidation,
        createIndex,
        closeDialog,
        requestState
      }
    }
  }
</script>
