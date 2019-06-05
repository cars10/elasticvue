<template>
  <v-dialog v-model="dialog" width="500">
    <v-btn id="new_snapshot_repository" slot="activator" color="primary" class="ml-0">New repository</v-btn>

    <v-card>
      <v-card-title>
        <h2 class="headline">New snapshot repository</h2>
      </v-card-title>

      <v-divider/>
      <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="createSnapshotRepository">
        <v-card-text>
          <v-text-field v-if="dialog"
                        id="repository_name"
                        ref="repositoryName"
                        v-model="repositoryName"
                        :rules="[nameRules]"
                        required
                        name="repositoryName"
                        label="Repository name"
                        autocomplete="off"
                        autofocus
                        @keyup.esc="closeDialog"/>

          <v-text-field id="repository_type"
                        value="fs"
                        name="repositoryType"
                        label="Repository type"
                        disabled/>

          <v-text-field id="repository_location"
                        v-model="repositoryLocation"
                        :rules="[locationRules]"
                        name="repositoryLocation"
                        label="Repository location"
                        required
                        @keyup.esc="closeDialog"/>

          <v-checkbox v-model="compress" hide-details label="Compress"/>
        </v-card-text>

        <v-card-actions class="pa-3">
          <v-btn id="create_snapshot_repository" :loading="loading" color="success" type="submit">Create</v-btn>
          <v-btn flat @click="closeDialog">Cancel</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
  import { elasticsearchRequest } from '@/mixins/ElasticsearchAdapterHelper'

  export default {
    name: 'NewRepository',
    data () {
      return {
        loading: false,
        dialog: false,
        valid: false,
        repositoryName: '',
        repositoryLocation: '',
        compress: true
      }
    },
    methods: {
      nameRules () {
        return !!this.repositoryName || 'Required'
      },
      locationRules () {
        return !!this.repositoryLocation || 'Required'
      },
      createSnapshotRepository () {
        if (!this.$refs.form.validate()) return
        this.loading = true

        elasticsearchRequest({
          method: 'snapshotCreateRepository',
          methodParams: this.buildCreateParams(),
          growl: `The repository '${this.repositoryName}' was successfully created.`,
          callback: () => {
            this.loading = false
            this.$emit('reloadData')
            this.closeDialog()
          }
        })
      },
      buildCreateParams () {
        return {
          repository: this.repositoryName,
          body: {
            type: 'fs',
            settings: {
              location: this.repositoryLocation,
              compress: this.compress
            }
          }
        }
      },
      closeDialog () {
        this.repositoryName = ''
        this.repositoryLocation = ''
        this.compress = true
        this.loading = false
        this.$refs.form.resetValidation()
        this.dialog = false
      }
    }
  }
</script>
