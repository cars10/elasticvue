<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{on}">
      <v-btn id="new_snapshot_repository" v-on="on" class="ml-0" color="primary-button">New repository</v-btn>
    </template>

    <v-card>
      <v-card-title>
        <h2 class="text-h5">New snapshot repository</h2>
        <div class="ml-a">
          <v-btn icon title="Close" @click.native="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <v-divider/>
      <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="createSnapshotRepository">
        <v-card-text>
          <v-text-field v-if="dialog"
                        id="repository_name"
                        v-model="repositoryName"
                        :rules="[nameRules]"
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
                        v-model="repositoryLocation"
                        :rules="[locationRules]"
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
                        v-model="maxRestoreBytesPerSec"
                        :rules="[maxRestoreBytesPerSecRules]"
                        label="max_restore_bytes_per_sec"
                        name="maxRestoreBytesPerSec"
                        required
                        @keydown.esc="closeDialog"/>

          <v-text-field id="max_snapshot_bytes_per_sec"
                        v-model="maxSnapshotBytesPerSec"
                        :rules="[maxSnapshotBytesPerSecRules]"
                        label="max_snapshot_bytes_per_sec"
                        name="max_snapshot_bytes_per_sec"
                        required
                        @keydown.esc="closeDialog"/>

          <v-checkbox id="compress" v-model="compress" color="primary-button" hide-details label="Compress"/>
          <v-checkbox id="readonly" v-model="readonly" color="primary-button" hide-details label="Readonly"/>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-btn id="create_snapshot_repository" :disabled="requestState.loading || !valid"
                 :loading="requestState.loading" color="success"
                 type="submit">Create
          </v-btn>
          <v-btn text @click="closeDialog">Cancel</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
  import { ref } from '@vue/composition-api'
  import { useElasticsearchRequest } from '@/mixins/RequestComposition'
  import { showErrorSnackbar, showSuccessSnackbar } from '@/mixins/ShowSnackbar'

  export default {
    name: 'new-repository',
    setup (props, context) {
      const dialog = ref(false)
      const valid = ref(false)
      const repositoryName = ref('')
      const repositoryLocation = ref('')
      const compress = ref(true)
      const chunkSize = ref(null)
      const maxRestoreBytesPerSec = ref('40mb')
      const maxSnapshotBytesPerSec = ref('40mb')
      const readonly = ref(false)

      const nameRules = () => {
        return !!repositoryName.value || 'Required'
      }

      const locationRules = () => {
        return !!repositoryLocation.value || 'Required'
      }

      const maxRestoreBytesPerSecRules = () => {
        return !!maxRestoreBytesPerSec.value || 'Required'
      }

      const maxSnapshotBytesPerSecRules = () => {
        return !!maxSnapshotBytesPerSec.value || 'Required'
      }

      const { requestState, callElasticsearch } = useElasticsearchRequest()

      const createSnapshotRepository = () => {
        if (!context.refs.form.validate()) return

        callElasticsearch('snapshotCreateRepository', buildCreateParams())
          .then(() => {
            context.emit('reloadData')
            showSuccessSnackbar({
              text: 'Success',
              additionalText: `The repository '${repositoryName.value}' was successfully created.`
            })
            closeDialog()
          })
          .catch(() => showErrorSnackbar({ text: 'Error:', additionalText: requestState.value.apiErrorMessage }))
      }

      const buildCreateParams = () => {
        return {
          repository: repositoryName.value,
          body: {
            type: 'fs',
            settings: {
              location: repositoryLocation.value,
              compress: compress.value,
              chunk_size: chunkSize.value,
              max_restore_bytes_per_sec: maxRestoreBytesPerSec.value,
              max_snapshot_bytes_per_sec: maxSnapshotBytesPerSec.value,
              readonly: readonly.value
            }
          }
        }
      }

      const closeDialog = () => {
        repositoryName.value = ''
        repositoryLocation.value = ''
        compress.value = true
        chunkSize.value = null
        maxRestoreBytesPerSec.value = '40mb'
        maxSnapshotBytesPerSec.value = '40mb'
        readonly.value = false
        context.refs.form.resetValidation()
        dialog.value = false
      }

      return {
        dialog,
        valid,
        repositoryName,
        repositoryLocation,
        compress,
        chunkSize,
        maxRestoreBytesPerSec,
        maxSnapshotBytesPerSec,
        readonly,
        nameRules,
        locationRules,
        maxRestoreBytesPerSecRules,
        maxSnapshotBytesPerSecRules,
        createSnapshotRepository,
        closeDialog,
        requestState
      }
    }
  }
</script>
