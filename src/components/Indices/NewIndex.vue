<template>
  <v-dialog v-model="dialog" width="500">
    <v-btn id="new_index" slot="activator" color="primary">New index</v-btn>

    <v-card>
      <v-card-title>
        <h2 class="headline">New index</h2>
      </v-card-title>

      <v-divider/>
      <v-card-text>
        <v-form>
          <v-text-field id="index_name"
                        v-model="indexName"
                        name="indexName"
                        label="Index name"/>

          <v-text-field id="index_shards"
                        v-model="indexShards"
                        name="indexShards"
                        placeholder="5"
                        label="Number of shards"/>

          <v-text-field id="index_replicas"
                        v-model="indexReplicas"
                        name="indexReplicas"
                        placeholder="1"
                        label="Number of replicas"/>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-btn id="create_index" flat @click="createIndex">Create</v-btn>
        <v-btn flat @click="closeDialog">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  export default {
    name: 'NewIndex',
    data () {
      return {
        dialog: false,
        indexName: '',
        indexShards: '',
        indexReplicas: ''
      }
    },
    computed: {
      createIndexParams () {
        return {
          index: this.indexName,
          body: {
            number_of_shards: this.indexShards || 5,
            number_of_replicas: this.indexReplicas || 1
          }
        }
      }
    },
    methods: {
      createIndex () {
        this.getElasticsearchAdapter()
          .then(adapter => adapter.indicesCreate(this.createIndexParams))
          .then(body => {
            this.showSuccessSnackbar({
              text: `The index '${this.indexName}' was successfully created.`,
              additionalText: JSON.stringify(body)
            })
            this.dialog = false
            this.$emit('reloadIndices')
          })
          .catch(error => this.$store.commit('connection/setErrorState', error))
      },
      closeDialog () {
        this.dialog = false
      }
    }
  }
</script>
