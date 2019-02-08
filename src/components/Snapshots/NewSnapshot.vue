<template>
  <v-dialog v-model="dialog" width="500">
    <v-btn slot="activator" color="primary" class="ml-0">New snapshot</v-btn>

    <v-card>
      <v-card-title>
        <h2 class="headline">New snapshot</h2>
      </v-card-title>

      <v-divider/>
      <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="createSnapshot">
        <v-card-text>
          <v-text-field v-if="dialog"
                        id="snapshot_name"
                        v-model="snapshotName"
                        :rules="[nameRules]"
                        required
                        name="snapshotName"
                        label="Snapshot name"
                        autocomplete="off"
                        autofocus
                        @keyup.esc="closeDialog"/>

          <data-loader ref="indicesLoader" method="catIndices" render-content-while-loading>
            <template slot-scope="data">
              <custom-v-autocomplete id="indices"
                                     v-model="indices"
                                     :items="data.body | sortIndices"
                                     :loading="data.loading"
                                     append-icon="arrow_drop_down"
                                     multiple
                                     chips
                                     label="Indices"
                                     name="indices"
                                     prepend-inner-icon="cached"
                                     @click:prepend-inner="resetIndices">

                <template slot="selection" slot-scope="{ item, index }">
                  <v-chip v-if="index <= 1">
                    <span>{{ item }}</span>
                  </v-chip>
                  <span v-if="index === 2" class="grey--text caption">(+{{ indices.length - 1 }} others)</span>
                </template>
              </custom-v-autocomplete>
            </template>
          </data-loader>
        </v-card-text>

        <v-card-actions>
          <v-btn id="create_snapshot" flat @click="createSnapshot">Create</v-btn>
          <v-btn flat @click="closeDialog">Cancel</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
  import CustomVAutocomplete from '@/components/shared/CustomVAutocomplete'

  export default {
    name: 'NewSnapshot',
    components: {
      CustomVAutocomplete
    },
    filters: {
      sortIndices (indices) {
        return indices ? indices.map(index => index.index).sort() : []
      }
    },
    props: {
      repository: {
        type: String,
        default: ''
      }
    },
    data () {
      return {
        dialog: false,
        valid: false,
        snapshotName: '',
        indices: []
      }
    },
    methods: {
      nameRules () {
        return !!this.snapshotName || 'Required'
      },
      createSnapshot () {
        if (!this.$refs.form.validate()) return

        this.elasticsearchRequest({
          method: 'snapshotCreate',
          methodParams: this.buildCreateParams(),
          growl: `The snapshot '${this.snapshotName}' was successfully created.`,
          callback: () => {
            this.$emit('reloadData')
            this.closeDialog()
          }
        })
      },
      buildCreateParams () {
        return {
          repository: this.repository,
          snapshot: this.snapshotName,
          body: {
            indices: this.indices
          }
        }
      },
      closeDialog () {
        this.snapshotName = ''
        this.indices = []
        this.$refs.form.resetValidation()
        this.dialog = false
      },
      resetIndices () {
        this.indices = []
        this.$refs.indicesLoader.loadData()
      }
    }
  }
</script>
