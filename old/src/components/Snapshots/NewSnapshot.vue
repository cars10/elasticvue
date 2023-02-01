<template>
  <v-dialog v-model="dialog" width="500">
    <template v-slot:activator="{on}">
      <v-btn v-on="on" :disabled="!repository" class="ml-0" color="primary-button">
        {{ $t('snapshots.new_snapshot.heading') }}
      </v-btn>
    </template>

    <v-card>
      <v-card-title>
        <h2 class="text-h5">{{ $t('snapshots.new_snapshot.heading') }}</h2>
        <div class="ml-a">
          <v-btn icon :title="$t('defaults.close')" @click.native="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <v-divider/>
      <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="createSnapshot">
        <v-card-text>
          <v-text-field id="repository"
                        :label="$t('snapshots.new_snapshot.form.repository.label')"
                        :value="repository"
                        disabled
                        name="repository"/>

          <v-text-field v-if="dialog"
                        id="snapshot_name"
                        v-model="snapshotName"
                        :label="$t('snapshots.new_snapshot.form.snapshot_name.label')"
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
            {{ $t('defaults.create') }}
          </v-btn>
          <v-btn text @click="closeDialog">{{ $t('defaults.cancel') }}</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
  import IndexFilter from '@/components/shared/IndexFilter'
  import { ref } from 'vue'
  import { showSnackbar } from '@/mixins/ShowSnackbar'
  import { useElasticsearchRequest } from '@/mixins/RequestComposition'
  import i18n from '@/i18n'

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
      const form = ref(null)
      const dialog = ref(false)
      const valid = ref(false)
      const snapshotName = ref('')
      const indices = ref('*')

      const nameRules = () => {
        return !!snapshotName.value || 'Required'
      }

      const { requestState, callElasticsearch } = useElasticsearchRequest()
      const createSnapshot = () => {
        if (!form.value.validate()) return

        callElasticsearch('snapshotCreate', buildCreateParams())
          .then(() => {
            context.emit('reloadData')
            showSnackbar(requestState.value, { body: i18n.t('snapshots.new_snapshot.create_snapshot.growl', { name: snapshotName.value }) })
            closeDialog()
          })
          .catch(() => showSnackbar(requestState.value))
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
        form.value.resetValidation()
        dialog.value = false
      }

      return {
        form,
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
