<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{on}">
      <v-btn v-on="on" :disabled="!repository" class="ml-0" color="primary-button">{{
          $t('snapshots.new-snapshot')
        }}
      </v-btn>
    </template>

    <v-card>
      <v-card-title>
        <h2 class="text-h5">{{ $t('snapshots.new-snapshot') }}</h2>
        <div class="ml-a">
          <v-btn icon title="Close" @click.native="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <v-divider/>
      <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="createSnapshot">
        <v-card-text>
          <v-text-field id="repository"
                        :label="$t('repository.repository')"
                        :value="repository"
                        disabled
                        name="repository"/>

          <v-text-field v-if="dialog"
                        id="snapshot_name"
                        v-model="snapshotName"
                        :label="$t('snapshots.snapshot-name')"
                        :rules="[nameRules]"
                        autocomplete="off"
                        autofocus
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
            {{ $t('snapshots.create') }}
          </v-btn>
          <v-btn text @click="closeDialog">{{ $t('snapshots.cancel') }}</v-btn>
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
