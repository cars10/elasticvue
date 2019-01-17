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

          <v-checkbox v-model="waitForCompletion" label="Wait for completion"/>
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
  export default {
    name: 'NewSnapshot',
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
        waitForCompletion: true
      }
    },
    methods: {
      nameRules () {
        return !!this.snapshotName || 'Required'
      },
      createSnapshot () {
        if (!this.$refs.form.validate()) return

        this.simpleRequest({
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
          waitForCompletion: this.waitForCompletion
        }
      },
      closeDialog () {
        this.snapshotName = ''
        this.$refs.form.resetValidation()
        this.dialog = false
      }
    }
  }
</script>
