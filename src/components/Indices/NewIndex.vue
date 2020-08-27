<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{on}">
      <v-btn id="new_index" class="ml-0" color="primary" v-on="on">New index</v-btn>
    </template>

    <v-card>
      <v-card-title>
        <h2 class="text-h5">New index</h2>
      </v-card-title>

      <v-divider/>
      <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="createIndex">
        <v-card-text>
          <v-text-field v-if="dialog"
                        id="index_name"
                        :rules="[nameValidation]"
                        v-model="indexName"
                        autofocus
                        label="Index name"
                        name="indexName"
                        required
                        @keyup.esc="closeDialog"/>

          <v-text-field id="index_shards"
                        v-model="indexShards"
                        label="Number of shards"
                        name="indexShards"
                        placeholder="1"
                        @keyup.esc="closeDialog"/>

          <v-text-field id="index_replicas"
                        v-model="indexReplicas"
                        label="Number of replicas"
                        name="indexReplicas"
                        placeholder="1"
                        @keyup.esc="closeDialog"/>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-btn id="create_index" color="success" type="submit">Create</v-btn>
          <v-btn text @click="closeDialog">Cancel</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
  import esAdapter from '@/mixins/GetAdapter'
  import { showErrorSnackbar, showSuccessSnackbar } from '@/mixins/ShowSnackbar'
  import { computed, ref } from '@vue/composition-api'

  export default {
    name: 'NewIndex',
    setup (props, context) {
      const dialog = ref(false)
      const valid = ref(false)
      const indexName = ref('')
      const indexShards = ref('')
      const indexReplicas = ref('')

      const createIndexParams = computed(() => {
        return {
          index: indexName.value,
          body: {
            settings: {
              number_of_shards: indexShards.value || 1,
              number_of_replicas: indexReplicas.value || 1
            }
          }
        }
      })

      const nameValidation = () => {
        return !!indexName.value || 'Required'
      }

      const createIndex = () => {
        if (!context.refs.form.validate()) return
        esAdapter()
          .then(adapter => adapter.indexCreate(createIndexParams.value))
          .then(body => {
            showSuccessSnackbar({
              text: `The index '${indexName.value}' was successfully created.`,
              additionalText: JSON.stringify(body)
            })
            dialog.value = false
            indexName.value = ''
            indexShards.value = ''
            indexReplicas.value = ''
            context.refs.form.reset()
            context.emit('reloadIndices')
          })
          .catch(error => showErrorSnackbar({ text: 'Error:', additionalText: error.message }))
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
        closeDialog
      }
    }
  }
</script>
