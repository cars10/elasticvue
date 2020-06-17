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

  export default {
    name: 'NewIndex',
    data () {
      return {
        dialog: false,
        valid: false,
        indexName: '',
        indexShards: '',
        indexReplicas: ''
      }
    },
    computed: {
      createIndexParams () {
        return {
          index: this.indexName,
          body: {
            settings: {
              number_of_shards: this.indexShards || 1,
              number_of_replicas: this.indexReplicas || 1
            }
          }
        }
      }
    },
    methods: {
      nameValidation () {
        return !!this.indexName || 'Required'
      },
      createIndex () {
        if (!this.$refs.form.validate()) return
        esAdapter()
          .then(adapter => adapter.indexCreate(this.createIndexParams))
          .then(body => {
            showSuccessSnackbar({
              text: `The index '${this.indexName}' was successfully created.`,
              additionalText: JSON.stringify(body)
            })
            this.dialog = false
            this.indexName = ''
            this.indexShards = ''
            this.indexReplicas = ''
            this.$refs.form.reset()
            this.$emit('reloadIndices')
          })
          .catch(error => showErrorSnackbar({ text: 'Error:', additionalText: error.message }))
      },
      closeDialog () {
        this.indexName = ''
        this.indexShards = ''
        this.indexReplicas = ''
        this.$refs.form.resetValidation()
        this.dialog = false
      }
    }
  }
</script>
