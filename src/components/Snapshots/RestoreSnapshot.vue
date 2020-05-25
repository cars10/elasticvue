<template>
  <div>
    <v-list-item @click.stop="toggle">
      <v-list-item-action>
        <v-icon small>mdi-restore</v-icon>
      </v-list-item-action>
      <v-list-item-content>
        <v-list-item-title>Restore</v-list-item-title>
      </v-list-item-content>
    </v-list-item>

    <v-dialog v-model="dialog" width="500">
      <v-card>
        <v-card-title>
          <h2 class="headline">Restore '{{snapshot}}'</h2>
        </v-card-title>
        <v-divider/>

        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="restoreSnapshot">
          <v-card-text>
            <index-filter :method-params="{ repository, snapshot }" v-model="indices" method="getSnapshotIndices"/>
            <v-checkbox v-model="ignore_unavailable" hide-details label="Ignore unavailable" color="primary"/>
            <v-checkbox v-model="include_global_state" label="Include global state" color="primary"/>

            <v-text-field v-if="dialog"
                          id="rename_pattern"
                          v-model="rename_pattern"
                          autocomplete="off"
                          label="Rename pattern"
                          name="rename_pattern"
                          @keyup.esc="closeDialog"/>

            <v-text-field v-if="dialog"
                          id="rename_replacement"
                          v-model="rename_replacement"
                          autocomplete="off"
                          hide-details
                          label="Rename replacement"
                          name="rename_replacement"
                          @keyup.esc="closeDialog"/>
          </v-card-text>

          <v-card-actions class="pa-4">
            <v-btn id="restore_snapshot" :loading="loading" :disabled="loading" color="success" type="submit">
              Restore
            </v-btn>
            <v-btn text @click="closeDialog">Cancel</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import ListTileLink from '@/components/shared/ListTile/ListTileLink'
  import CustomVAutocomplete from '@/components/shared/CustomVAutocomplete'
  import { elasticsearchRequest } from '@/mixins/ElasticsearchAdapterHelper'
  import IndexFilter from '@/components/shared/IndexFilter'

  export default {
    name: 'RestoreSnapshot',
    components: {
      CustomVAutocomplete,
      IndexFilter,
      ListTileLink
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
    data () {
      return {
        dialog: false,
        valid: false,
        loading: false,
        indices: '*',
        ignore_unavailable: true,
        include_global_state: true,
        rename_pattern: '',
        rename_replacement: ''
      }
    },
    methods: {
      toggle () {
        this.dialog = true
      },
      restoreSnapshot () {
        if (!this.$refs.form.validate()) return
        this.loading = true

        elasticsearchRequest({
          method: 'snapshotRestore',
          methodParams: this.buildRestoreParams(),
          growl: `The snapshot '${this.snapshot}' was successfully restored.`,
          callback: this.closeDialog
        })
      },
      buildRestoreParams () {
        return {
          repository: this.repository,
          snapshot: this.snapshot,
          body: {
            indices: this.indices,
            ignore_unavailable: this.ignore_unavailable,
            include_global_state: this.include_global_state,
            rename_pattern: this.rename_pattern,
            rename_replacement: this.rename_replacement
          }
        }
      },
      closeDialog () {
        this.$refs.form.resetValidation()
        this.dialog = false
        this.loading = false
        this.indices = []
        this.ignore_unavailable = true
        this.include_global_state = true
        this.rename_pattern = ''
        this.rename_replacement = ''
      }
    }
  }
</script>
