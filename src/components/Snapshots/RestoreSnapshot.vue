<template>
  <div>
    <v-list-item @click.stop="dialog = true">
      <v-list-item-action>
        <v-icon small>mdi-restore</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>{{ $t('snapshots.restore.title') }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-dialog v-model="dialog" width="700">
      <v-card>
        <v-card-title>
          <h2 class="text-h5">{{ $t('snapshots.restore.title') }} '{{ snapshot }}'</h2>
          <div class="ml-a">
            <v-btn icon title="Close" @click.native="closeDialog">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </v-card-title>
        <v-divider/>

        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="restoreSnapshot">
          <v-card-text>
            <index-filter v-model="indices" :method-params="{ repository, snapshot }" method="getSnapshotIndices"/>
            <v-checkbox v-model="ignoreUnavailable" color="primary-button" hide-details :label="$t('snapshots.restore.ignore-unavailable')"/>
            <v-checkbox v-model="includeGlobalState" color="primary-button" :label="$t('snapshots.restore.include-global-state')"/>

            <v-text-field v-if="dialog"
                          id="rename_pattern"
                          v-model="renamePattern"
                          autocomplete="off"
                          :label="$t('snapshots.restore.rename-pattern')"
                          name="rename_pattern"
                          @keyup.esc="closeDialog"/>

            <v-text-field v-if="dialog"
                          id="rename_replacement"
                          v-model="renameReplacement"
                          autocomplete="off"
                          hide-details
                          :label="$t('snapshots.restore.rename-replacement')"
                          name="rename_replacement"
                          @keyup.esc="closeDialog"/>
          </v-card-text>

          <v-card-actions class="pa-4">
            <v-btn id="restore_snapshot" :disabled="requestState.loading || !valid" :loading="requestState.loading"
                   color="success" type="submit">
              {{ $t('snapshots.restore.restore') }}
            </v-btn>
            <v-btn text @click="closeDialog">{{ $t('snapshots.restore.cancel') }}</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import i18n from '@/i18n'
  import IndexFilter from '@/components/shared/IndexFilter'
  import { ref } from '@vue/composition-api'
  import { useElasticsearchRequest } from '@/mixins/RequestComposition'
  import { showErrorSnackbar, showSuccessSnackbar } from '@/mixins/ShowSnackbar'

  export default {
    name: 'restore-snapshot',
    components: {
      IndexFilter
    },
    props: {
      snapshot: {
        default: '',
        type: String
      },
      repository: {
        default: '',
        type: String
      }
    },
    setup (props, context) {
      const dialog = ref(false)
      const valid = ref(false)
      const indices = ref('*')
      const ignoreUnavailable = ref(true)
      const includeGlobalState = ref(true)
      const renamePattern = ref('')
      const renameReplacement = ref('')

      const closeDialog = () => {
        context.refs.form.resetValidation()
        dialog.value = false
        indices.value = '*'
        ignoreUnavailable.value = true
        includeGlobalState.value = true
        renamePattern.value = ''
        renameReplacement.value = ''
      }

      const buildRestoreParams = () => {
        return {
          repository: props.repository,
          snapshot: props.snapshot,
          body: {
            indices: indices.value,
            ignore_unavailable: ignoreUnavailable.value,
            include_global_state: includeGlobalState.value,
            rename_pattern: renamePattern.value,
            rename_replacement: renameReplacement.value
          }
        }
      }

      const { requestState, callElasticsearch } = useElasticsearchRequest()
      const restoreSnapshot = () => {
        if (!context.refs.form.validate()) return

        callElasticsearch('snapshotRestore', buildRestoreParams())
          .then(() => {
            showSuccessSnackbar({
              text: i18n.t('snapshots.restore.success'),
              additionalText: i18n.t('snapshots.restore.success-message', { snapshot: props.snapshot })
            })
            closeDialog()
          })
          .catch(() => showErrorSnackbar({ text: i18n.t('snapshots.restore.error'), additionalText: requestState.value.apiErrorMessage }))
      }

      return {
        dialog,
        valid,
        indices,
        ignoreUnavailable,
        includeGlobalState,
        renamePattern,
        renameReplacement,
        requestState,
        closeDialog,
        restoreSnapshot
      }
    }
  }
</script>
