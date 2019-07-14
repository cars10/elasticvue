<template>
  <v-card>
    <v-card-title>
      <h2 class="headline">Node Information</h2>
      <reload-button :action="() => $refs.dataLoader.loadData()"/>
    </v-card-title>
    <v-divider/>

    <data-loader ref="dataLoader" method="clientInfo">
      <template v-slot:default="data">
        <v-list v-if="data.body['version']" dense class="text--small">
          <v-list-item>
            <v-list-item-content>name</v-list-item-content>
            <v-list-item-content><span class="text-xs-right">{{data.body['name']}}</span></v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>cluster_name</v-list-item-content>
            <v-list-item-content><span class="text-xs-right">{{data.body['cluster_name']}}</span></v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>cluster_uuid</v-list-item-content>
            <v-list-item-content><span class="text-xs-right">{{data.body['cluster_uuid']}}</span></v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>tagline</v-list-item-content>
            <v-list-item-content><span class="text-xs-right">{{data.body['tagline']}}</span></v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>version.number</v-list-item-content>
            <v-list-item-content><span class="text-xs-right">{{data.body['version']['number']}}</span>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>version.build_flavor</v-list-item-content>
            <v-list-item-content><span class="text-xs-right">{{data.body['version']['build_flavor']}}</span>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>version.build_type</v-list-item-content>
            <v-list-item-content><span class="text-xs-right">{{data.body['version']['build_type']}}</span>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>version.build_hash</v-list-item-content>
            <v-list-item-content><span class="text-xs-right">{{data.body['version']['build_hash']}}</span>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>version.build_date</v-list-item-content>
            <v-list-item-content><span class="text-xs-right">{{data.body['version']['build_date']}}</span>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>version.build_snapshot</v-list-item-content>
            <v-list-item-content><span class="text-xs-right">{{data.body['version']['build_snapshot']}}</span>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>version.lucene_version</v-list-item-content>
            <v-list-item-content><span class="text-xs-right">{{data.body['version']['lucene_version']}}</span>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>version.minimum_wire_compatibility_version</v-list-item-content>
            <v-list-item-content>
              <span class="text-xs-right">{{data.body['version']['minimum_wire_compatibility_version']}}</span>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content>version.minimum_index_compatibility_version</v-list-item-content>
            <v-list-item-content>
              <span class="text-xs-right">{{data.body['version']['minimum_index_compatibility_version']}}</span>
            </v-list-item-content>
          </v-list-item>
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
