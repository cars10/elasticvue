<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{on}">
      <v-btn :disabled="!repository" class="ml-0" color="primary" v-on="on">New snapshot</v-btn>
    </template>

    <v-card>
      <v-card-title>
        <h2 class="text-h5">New snapshot</h2>
      </v-card-title>

      <v-divider/>
      <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="createSnapshot">
        <v-card-text>
          <v-text-field id="repository"
                        :value="repository"
                        disabled
                        label="Repository"
                        name="repository"/>

          <v-text-field v-if="dialog"
                        id="snapshot_name"
                        v-model="snapshotName"
                        :rules="[nameRules]"
                        autocomplete="off"
                        autofocus
                        label="Snapshot name"
                        name="snapshotName"
                        required
                        @keyup.esc="closeDialog"/>

          <index-filter v-model="indices" method="catIndices"/>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-btn id="create_snapshot"
                 :disabled="requestState.loading || !valid"
                 :loading="requestState.loading"
                 color="success"
                 type="submit">
            Create
          </v-btn>
          <v-btn text @click="closeDialog">Cancel</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
  import IndexFilter from '@/components/shared/IndexFilter'
  import { ref } from '@vue/composition-api'
  import { showErrorSnackbar, showSuccessSnackbar } from '@/mixins/ShowSnackbar'
  import { useElasticsearchRequest } from '@/mixins/RequestComposition'

  export default {
    name: 'new-snapshot',
    components: {
      IndexFilter
    },
    props: {
      repository: {
        type: String,
        default: ''
      }
    },
    setup (props, context) {
      const dialog = ref(false)
      const valid = ref(false)
      const snapshotName = ref('')
      const indices = ref('*')

      const nameRules = () => {
        return !!snapshotName.value || 'Required'
      }

      const { requestState, callElasticsearch } = useElasticsearchRequest()
      const createSnapshot = () => {
        if (!context.refs.form.validate()) return

        callElasticsearch('snapshotCreate', buildCreateParams())
          .then(() => {
            context.emit('reloadData')
            showSuccessSnackbar({
              text: 'Success',
              additionalText: `The snapshot '${snapshotName.value}' was successfully created.`
            })
            closeDialog()
          })
          .catch(() => showErrorSnackbar({ text: 'Error:', additionalText: requestState.value.apiErrorMessage }))
      }

      const buildCreateParams = () => {
        return {
          repository: props.repository,
          snapshot: snapshotName.value,
          body: {
            indices: indices.value
          }
        }
      }

      const closeDialog = () => {
        snapshotName.value = ''
        indices.value = '*'
        context.refs.form.resetValidation()
        dialog.value = false
      }

      return {
        dialog,
        valid,
        snapshotName,
        indices,
        nameRules,
        createSnapshot,
        closeDialog,
        requestState
      }
    }
  }
</script>
