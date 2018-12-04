<template>
  <v-dialog v-model="dialog" width="500">
    <v-btn id="new_index" slot="activator" color="primary" class="ml-0">New index</v-btn>

    <v-card>
      <v-card-title>
        <h2 class="headline">New index</h2>
      </v-card-title>

      <v-divider/>
      <v-card-text>
        <v-form ref="form" v-model="valid" lazy-validation>
          <v-text-field id="index_name"
                        v-model="indexName"
                        :rules="[nameValidation]"
                        required
                        name="indexName"
                        label="Index name"/>

          <v-text-field id="index_shards"
                        v-model="indexShards"
                        name="indexShards"
                        placeholder="5"
                        label="Number of shards"/>

          <v-text-field id="index_replicas"
                        v-model="indexReplicas"
                        name="indexReplicas"
                        placeholder="1"
                        label="Number of replicas"/>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-btn id="create_index" flat @click="createIndex">Create</v-btn>
        <v-btn flat @click="closeDialog">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
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
            number_of_shards: this.indexShards || 5,
            number_of_replicas: this.indexReplicas || 1
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
        this.getElasticsearchAdapter()
          .then(adapter => adapter.indicesCreate(this.createIndexParams))
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
        this.dialog = false
      }
    }
  }
</script>
