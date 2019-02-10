<template>
  <div>
    <v-list-tile @click.stop="toggle">
      <v-list-tile-action>
        <v-icon small>restore</v-icon>
      </v-list-tile-action>
      <v-list-tile-content>
        <v-list-tile-title>Restore</v-list-tile-title>
      </v-list-tile-content>
    </v-list-tile>

    <v-dialog v-model="dialog" width="500" lazy>
      <v-card>
        <v-card-title>
          <h2 class="headline">Restore '{{snapshot}}'</h2>
        </v-card-title>
        <v-divider/>

        <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="restoreSnapshot">
          <v-card-text>
            <custom-v-autocomplete id="indices"
                                   v-model="selectedIndices"
                                   :items="indices"
                                   :loading="loading"
                                   append-icon="arrow_drop_down"
                                   multiple
                                   chips
                                   label="Indices"
                                   name="indices"
                                   prepend-inner-icon="cached"
                                   hide-details
                                   @click:prepend-inner="loadIndices">

              <template slot="selection" slot-scope="{ item, index }">
                <v-chip v-if="index <= 1">
                  <span>{{ item }}</span>
                </v-chip>
                <span v-if="index === 2" class="grey--text caption">(+{{ indices.length - 1 }} others)</span>
              </template>
            </custom-v-autocomplete>
            <v-checkbox v-model="ignore_unavailable" hide-details label="Ignore unavailable"/>
            <v-checkbox v-model="include_global_state" label="Include global state"/>

            <v-text-field v-if="dialog"
                          id="rename_pattern"
                          v-model="rename_pattern"
                          name="rename_pattern"
                          label="Rename pattern"
                          autocomplete="off"
                          @keyup.esc="closeDialog"/>

            <v-text-field v-if="dialog"
                          id="rename_replacement"
                          v-model="rename_replacement"
                          name="rename_replacement"
                          label="Rename replacement"
                          autocomplete="off"
                          hide-details
                          @keyup.esc="closeDialog"/>
          </v-card-text>

          <v-card-actions class="pa-3">
            <v-btn id="restore_snapshot" color="success" type="submit">Restore</v-btn>
            <v-btn flat @click="closeDialog">Cancel</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
  import ListTileLink from '@/components/shared/ListTile/ListTileLink'
  import CustomVAutocomplete from '@/components/shared/CustomVAutocomplete'

  export default {
    name: 'RestoreSnapshot',
    components: {
      CustomVAutocomplete,
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
        indices: [],
        selectedIndices: [],
        ignore_unavailable: true,
        include_global_state: true,
        rename_pattern: '',
        rename_replacement: ''
      }
    },
    methods: {
      toggle () {
        this.dialog = true
        this.loadIndices()
      },
      loadIndices () {
        this.indices = []
        this.loading = true
        this.elasticsearchRequest({
          method: 'getSnapshot',
          methodParams: { repository: this.repository, snapshot: this.snapshot },
          callback: body => {
            this.indices = body.snapshots[0].indices
            this.loading = false
          }
        })
      },
      restoreSnapshot () {
        if (!this.$refs.form.validate()) return

        this.elasticsearchRequest({
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
            indices: this.selectedIndices,
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
        this.selectedIndices = []
        this.ignore_unavailable = true
        this.include_global_state = true
        this.rename_pattern = ''
        this.rename_replacement = ''
      }
    }
  }
</script>
