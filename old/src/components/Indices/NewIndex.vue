<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{on}">
      <v-btn id="new_index" v-on="on" class="ml-0" color="primary-button">{{ $t('indices.new_index.heading') }}</v-btn>
    </template>

    <v-card>
      <v-card-title>
        <h2 class="text-h5">{{ $t('indices.new_index.heading') }}</h2>
        <div class="ml-a">
          <v-btn icon :title="$t('defaults.close')" @click.native="closeDialog">
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
                        :label="$t('indices.new_index.form.index_name.label')"
                        :rules="[nameValidation]"
                        autocomplete="off"
                        autofocus
                        name="indexName"
                        required
                        @keyup.esc="closeDialog"/>

          <v-text-field id="index_shards"
                        v-model="indexShards"
                        :label="$t('indices.new_index.form.shards.label')"
                        autocomplete="off"
                        name="indexShards"
                        placeholder="1"
                        type="number"
                        @keyup.esc="closeDialog"/>

          <v-text-field id="index_replicas"
                        v-model="indexReplicas"
                        :label="$t('indices.new_index.form.replicas.label')"
                        autocomplete="off"
                        name="indexReplicas"
                        placeholder="1"
                        type="number"
                        @keyup.esc="closeDialog"/>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-btn id="create_index"
                 :disabled="requestState.loading || !valid"
                 :loading="requestState.loading"
                 color="success"
                 type="submit">
            {{ $t('defaults.create') }}
          </v-btn>
          <v-btn text @click="closeDialog">{{ $t('defaults.cancel') }}</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
  import { showSnackbar } from '@/mixins/ShowSnackbar'
  import { ref } from 'vue'
  import { useElasticsearchRequest } from '@/mixins/RequestComposition'
  import i18n from '@/i18n'

  export default {
    name: 'new-index',
    setup (props, context) {
      const form = ref(null)
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
        return !!indexName.value || i18n.t('defaults.required')
      }

      const { requestState, callElasticsearch } = useElasticsearchRequest()
      const createIndex = () => {
        if (!form.value.validate()) return

        callElasticsearch('indexCreate', buildCreateParams())
          .then(body => {
            context.emit('reloadIndices')
            showSnackbar(requestState.value, {
              title: i18n.t('indices.new_index.create_index.growl', { index: indexName.value }),
              body: JSON.stringify(body)
            })
            closeDialog()
          })
          .catch(() => showSnackbar(requestState.value))
      }

      const closeDialog = () => {
        indexName.value = ''
        indexShards.value = ''
        indexReplicas.value = ''
        form.value.resetValidation()
        dialog.value = false
      }

      return {
        form,
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
