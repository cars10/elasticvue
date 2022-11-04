<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{on}">
      <v-btn id="new_snapshot_repository" v-on="on" class="ml-0" color="primary-button">{{
          $t('repositories.new_repository.heading')
        }}
      </v-btn>
    </template>

    <v-card>
      <v-card-title>
        <h2 class="text-h5">{{ $t('repositories.new_repository.heading') }}</h2>
        <div class="ml-a">
          <v-btn icon :title="$t('defaults.close')" @click.native="closeDialog">
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
                        :label="$t('repositories.new_repository.form.name.label')"
                        :rules="[nameRules]"
                        autocomplete="off"
                        autofocus
                        name="repositoryName"
                        required
                        @keydown.esc="closeDialog"/>

          <v-text-field id="repository_type"
                        :label="$t('repositories.new_repository.form.type.label')"
                        disabled
                        name="repositoryType"
                        value="fs"/>

          <v-text-field id="repository_location"
                        v-model="repositoryLocation"
                        :label="$t('repositories.new_repository.form.location.label')"
                        :rules="[locationRules]"
                        name="repositoryLocation"
                        placeholder="/some/path"
                        required
                        @keydown.esc="closeDialog"/>

          <v-text-field id="chunk_size"
                        v-model="chunkSize"
                        :label="$t('repositories.new_repository.form.chunk_size.label')"
                        name="chunk_size"
                        placeholder="e.g.: 1g, 10m, 5k"
                        @keydown.esc="closeDialog"/>

          <v-text-field id="max_restore_bytes_per_sec"
                        v-model="maxRestoreBytesPerSec"
                        :label="$t('repositories.new_repository.form.max_restore_bytes_per_sec.label')"
                        :rules="[maxRestoreBytesPerSecRules]"
                        name="maxRestoreBytesPerSec"
                        required
                        @keydown.esc="closeDialog"/>

          <v-text-field id="max_snapshot_bytes_per_sec"
                        v-model="maxSnapshotBytesPerSec"
                        :label="$t('repositories.new_repository.form.max_snapshot_bytes_per_sec.label')"
                        :rules="[maxSnapshotBytesPerSecRules]"
                        name="max_snapshot_bytes_per_sec"
                        required
                        @keydown.esc="closeDialog"/>

          <v-checkbox id="compress" v-model="compress" :label="$t('repositories.new_repository.form.compress.label')"
                      color="primary-button"
                      hide-details/>
          <v-checkbox id="readonly" v-model="readonly" :label="$t('repositories.new_repository.form.readonly.label')"
                      color="primary-button"
                      hide-details/>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-btn id="create_snapshot_repository" :disabled="requestState.loading || !valid"
                 :loading="requestState.loading" color="success"
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
  import { ref } from 'vue'
  import { useElasticsearchRequest } from '@/mixins/RequestComposition'
  import { showSnackbar } from '@/mixins/ShowSnackbar'
  import i18n from '@/i18n'

  export default {
    name: 'new-repository',
    setup (props, context) {
      const form = ref(null)
      const dialog = ref(false)
      const valid = ref(false)
      const repositoryName = ref('')
      const repositoryLocation = ref('')
      const compress = ref(true)
      const chunkSize = ref(null)
      const maxRestoreBytesPerSec = ref('40mb')
      const maxSnapshotBytesPerSec = ref('40mb')
      const readonly = ref(false)

      const nameRules = () => (!!repositoryName.value || i18n.t('defaults.required'))
      const locationRules = () => (!!repositoryLocation.value || i18n.t('defaults.required'))
      const maxRestoreBytesPerSecRules = () => (!!maxRestoreBytesPerSec.value || i18n.t('defaults.required'))
      const maxSnapshotBytesPerSecRules = () => (!!maxSnapshotBytesPerSec.value || i18n.t('defaults.required'))

      const { requestState, callElasticsearch } = useElasticsearchRequest()

      const createSnapshotRepository = () => {
        if (!form.value.validate()) return

        callElasticsearch('snapshotCreateRepository', buildCreateParams())
          .then(() => {
            context.emit('reloadData')
            showSnackbar(requestState.value, {
              body: i18n.t('repositories.new_repository.create_repository.growl', { repositoryName: repositoryName.value })
            })
            closeDialog()
          })
          .catch(() => showSnackbar(requestState.value))
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
        form.value.resetValidation()
        dialog.value = false
      }

      return {
        form,
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
