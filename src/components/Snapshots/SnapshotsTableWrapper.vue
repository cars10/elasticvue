<template>
  <div>
    <v-card-text>
      <v-row>
        <v-col>
          <new-snapshot :repository="repository" @reloadData="reloadData"/>
        </v-col>
        <v-col>
          <div class="float-right d-inline-flex">
            <data-loader method="catRepositories" render-content-while-loading>
              <template v-slot:default="{body, loading}">
                <v-select :items="body ? Object.keys(body) : [repository]"
                          v-model="repository"
                          :loading="loading"
                          hide-details
                          label="Repository"
                          class="pr-4 pt-0 mt-0"
                          name="repository"/>
              </template>
            </data-loader>
            <v-text-field id="filter"
                          v-model="filter"
                          append-icon="mdi-magnify"
                          autofocus
                          class="mt-0 pt-0 v-text-field--small"
                          hide-details
                          label="Filter..."
                          name="filter"
                          title="Filter via 'column:query'"
                          @keyup.esc="filter = ''"/>
          </div>
        </v-col>
      </v-row>
    </v-card-text>

    <template v-if="repository">
      <data-loader ref="dataLoader" :method-params="{repository}" :execute="!!repository" method="catSnapshots"
                   render-content-while-loading>
        <template v-slot:default="data">
          <snapshots-table :loading="data.loading" :snapshots="data.body || []" :filter="filter"
                           :repository="repository" @reloadData="reloadData"/>
        </template>
      </data-loader>
    </template>
    <template v-else>
      <div class="text-center">
        <v-alert color="grey" class="d-inline-block">Please select a repository first.</v-alert>
      </div>
    </template>
  </div>
</template>

<script>
  import DataLoader from '@/components/shared/DataLoader'
  import NewSnapshot from '@/components/Snapshots/NewSnapshot'
  import SnapshotsTable from '@/components/Snapshots/SnapshotsTable'
  import { mapVuexAccessors } from '@/helpers/store'

  export default {
    name: 'snapshots-table-wrapper',
    components: {
      DataLoader,
      NewSnapshot,
      SnapshotsTable
    },
    computed: {
      ...mapVuexAccessors('snapshots', ['filter', 'repository'])
    },
    watch: {
      repository: function () {
        this.$nextTick(() => {
          this.reloadData()
        })
      }
    },
    methods: {
      reloadData () {
        this.$refs.dataLoader.loadData()
      }
    }
  }
</script>
