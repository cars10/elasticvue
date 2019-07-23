<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{on}">
      <v-btn id="new_snapshot_repository" class="ml-0" color="primary" v-on="on">New repository</v-btn>
    </template>

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
                        :rules="[nameRules]"
                        v-model="repositoryName"
                        autocomplete="off"
                        autofocus
                        label="Repository name"
                        name="repositoryName"
                        required
                        @keydown.esc="closeDialog"/>

          <v-text-field id="repository_type"
                        disabled
                        label="Repository type"
                        name="repositoryType"
                        value="fs"/>

          <v-text-field id="repository_location"
                        :rules="[locationRules]"
                        v-model="repositoryLocation"
                        label="Repository location"
                        name="repositoryLocation"
                        placeholder="/some/path"
                        required
                        @keydown.esc="closeDialog"/>

          <v-text-field id="chunk_size"
                        v-model="chunkSize"
                        label="Chunk size"
                        name="chunk_size"
                        placeholder="e.g.: 1g, 10m, 5k"
                        @keydown.esc="closeDialog"/>

          <v-text-field id="max_restore_bytes_per_sec"
                        :rules="[maxRestoreBytesPerSecRules]"
                        v-model="maxRestoreBytesPerSec"
                        label="max_restore_bytes_per_sec"
                        name="maxRestoreBytesPerSec"
                        required
                        @keydown.esc="closeDialog"/>

          <v-text-field id="max_snapshot_bytes_per_sec"
                        :rules="[maxSnapshotBytesPerSecRules]"
                        v-model="maxSnapshotBytesPerSec"
                        label="max_snapshot_bytes_per_sec"
                        name="max_snapshot_bytes_per_sec"
                        required
                        @keydown.esc="closeDialog"/>

          <v-checkbox v-model="compress" hide-details label="Compress"/>
          <v-checkbox v-model="readonly" hide-details label="Readonly"/>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-btn id="create_snapshot_repository" :loading="loading" color="success" type="submit">Create</v-btn>
          <v-btn text @click="closeDialog">Cancel</v-btn>
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
        compress: true,
        chunkSize: null,
        maxRestoreBytesPerSec: '40mb',
        maxSnapshotBytesPerSec: '40mb',
        readonly: false
      }
    },
    methods: {
      nameRules () {
        return !!this.repositoryName || 'Required'
      },
      locationRules () {
        return !!this.repositoryLocation || 'Required'
      },
      maxRestoreBytesPerSecRules () {
        return !!this.maxRestoreBytesPerSec || 'Required'
      },
      maxSnapshotBytesPerSecRules () {
        return !!this.maxSnapshotBytesPerSec || 'Required'
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
              compress: this.compress,
              chunk_size: this.chunkSize,
              max_restore_bytes_per_sec: this.maxRestoreBytesPerSec,
              max_snapshot_bytes_per_sec: this.maxSnapshotBytesPerSec,
              readonly: this.readonly
            }
          }
        }
      },
      closeDialog () {
        this.repositoryName = ''
        this.repositoryLocation = ''
        this.compress = true
        this.chunkSize = null
        this.maxRestoreBytesPerSec = '40mb'
        this.maxSnapshotBytesPerSec = '40mb'
        this.readonly = false
        this.loading = false
        this.$refs.form.resetValidation()
        this.dialog = false
      }
    }
  }
</script>
