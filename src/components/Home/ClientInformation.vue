<template>
  <v-card>
    <v-card-title>
      <h2 class="headline">Node Information</h2>
      <reload-button :action="() => $refs.dataLoader.loadData()"/>
    </v-card-title>
    <v-divider/>

    <data-loader ref="dataLoader" method="clientInfo">
      <template v-slot:default="data">
        <v-list v-if="data.body['version']" dense>
          <v-list-tile>
            <v-list-tile-content>name</v-list-tile-content>
            <v-list-tile-content class="align-end">{{data.body['name']}}</v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>cluster_name</v-list-tile-content>
            <v-list-tile-content class="align-end">{{data.body['cluster_name']}}</v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>cluster_uuid</v-list-tile-content>
            <v-list-tile-content class="align-end">{{data.body['cluster_uuid']}}</v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>tagline</v-list-tile-content>
            <v-list-tile-content class="align-end">{{data.body['tagline']}}</v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>version.number</v-list-tile-content>
            <v-list-tile-content class="align-end">{{data.body['version']['number']}}</v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>version.build_flavor</v-list-tile-content>
            <v-list-tile-content class="align-end">{{data.body['version']['build_flavor']}}</v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>version.build_type</v-list-tile-content>
            <v-list-tile-content class="align-end">{{data.body['version']['build_type']}}</v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>version.build_hash</v-list-tile-content>
            <v-list-tile-content class="align-end">{{data.body['version']['build_hash']}}</v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>version.build_date</v-list-tile-content>
            <v-list-tile-content class="align-end">{{data.body['version']['build_date']}}</v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>version.build_snapshot</v-list-tile-content>
            <v-list-tile-content class="align-end">{{data.body['version']['build_snapshot']}}</v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>version.lucene_version</v-list-tile-content>
            <v-list-tile-content class="align-end">{{data.body['version']['lucene_version']}}</v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>version.minimum_wire_compatibility_version</v-list-tile-content>
            <v-list-tile-content class="align-end">{{data.body['version']['minimum_wire_compatibility_version']}}
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-content>version.minimum_index_compatibility_version</v-list-tile-content>
            <v-list-tile-content class="align-end">{{data.body['version']['minimum_index_compatibility_version']}}
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </template>
    </data-loader>
  </v-card>
</template>

<script>
  import DataLoader from '@/components/shared/DataLoader'
  import ReloadButton from '@/components/shared/ReloadButton'

  export default {
    name: 'client-information',
    components: {
      DataLoader,
      ReloadButton
    }
  }
</script>
