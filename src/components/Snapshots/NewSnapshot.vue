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
                        :rules="[nameRules]"
                        v-model="snapshotName"
                        autocomplete="off"
                        autofocus
                        label="Snapshot name"
                        name="snapshotName"
                        required
                        @keyup.esc="closeDialog"/>

          <index-filter v-model="indices" method="catIndices"/>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-btn id="create_snapshot" :disabled="loading || !valid" :loading="loading" color="success" type="submit">
            Create
          </v-btn>
          <v-btn text @click="closeDialog">Cancel</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
  import DataLoader from '@/components/shared/DataLoader'
  import { elasticsearchRequest } from '@/mixins/ElasticsearchAdapterHelper'
  import IndexFilter from '@/components/shared/IndexFilter'

  export default {
    name: 'new-snapshot',
    components: {
      DataLoader,
      IndexFilter
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
        loading: false,
        indices: '*'
      }
    },
    methods: {
      nameRules () {
        return !!this.snapshotName || 'Required'
      },
      createSnapshot () {
        if (!this.$refs.form.validate()) return

        this.loading = true

        elasticsearchRequest({
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
        this.loading = false
        this.$refs.form.resetValidation()
        this.dialog = false
      }
    }
  }
</script>
