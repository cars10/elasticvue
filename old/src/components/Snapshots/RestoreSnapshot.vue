<template>
  <div>
    <v-list-item @click.stop="dialog = true">
      <v-list-item-action>
        <v-icon small>mdi-restore</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>{{ $t('snapshots.restore_snapshot.button') }}</v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-dialog v-model="dialog" width="700">
      <v-card>
        <v-card-title>
          <h2 class="text-h5">{{ $t('snapshots.restore_snapshot.heading', { name: snapshot }) }}</h2>
          <div class="ml-a">
            <v-btn icon :title="$t('defaults.close')" @click.native="closeDialog">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </v-card-title>
        <v-divider/>

        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="restoreSnapshot">
          <v-card-text>
            <index-filter v-model="indices" :method-params="{ repository, snapshot }" method="getSnapshotIndices"/>
            <v-checkbox v-model="ignoreUnavailable"
                        :label="$t('snapshots.restore_snapshot.form.ignore_unavailable.label')"
                        color="primary-button"
                        hide-details/>
            <v-checkbox v-model="includeGlobalState"
                        :label="$t('snapshots.restore_snapshot.form.include_global_state.label')"
                        color="primary-button"/>

            <v-text-field v-if="dialog"
                          id="rename_pattern"
                          v-model="renamePattern"
                          :label="$t('snapshots.restore_snapshot.form.rename_pattern.label')"
                          autocomplete="off"
                          name="rename_pattern"
                          @keyup.esc="closeDialog"/>

            <v-text-field v-if="dialog"
                          id="rename_replacement"
                          v-model="renameReplacement"
                          :label="$t('snapshots.restore_snapshot.form.rename_replacement.label')"
                          autocomplete="off"
                          hide-details
                          name="rename_replacement"
                          @keyup.esc="closeDialog"/>
          </v-card-text>

          <v-card-actions class="pa-4">
            <v-btn id="restore_snapshot" :disabled="requestState.loading || !valid" :loading="requestState.loading"
                   color="success" type="submit">
              {{ $t('snapshots.restore_snapshot.form.restore') }}
            </v-btn>
            <v-btn text @click="closeDialog">{{ $t('defaults.cancel') }}</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import i18n from '@/i18n'
  import IndexFilter from '@/components/shared/IndexFilter'
  import { ref } from 'vue'
  import { useElasticsearchRequest } from '@/mixins/RequestComposition'
  import { showSnackbar } from '@/mixins/ShowSnackbar'

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
      const form = ref(null)
      const dialog = ref(false)
      const valid = ref(false)
      const indices = ref('*')
      const ignoreUnavailable = ref(true)
      const includeGlobalState = ref(true)
      const renamePattern = ref('')
      const renameReplacement = ref('')

      const closeDialog = () => {
        form.value.resetValidation()
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
        if (!form.value.validate()) return

        callElasticsearch('snapshotRestore', buildRestoreParams())
          .then(() => {
            showSnackbar(requestState.value, {
              body: i18n.t('snapshots.restore_snapshot.restore_snapshot.growl', { snapshot: props.snapshot })
            })
            closeDialog()
          })
          .catch(() => showSnackbar(requestState.value))
      }

      return {
        form,
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
