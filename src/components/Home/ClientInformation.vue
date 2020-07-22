<template>
  <v-card>
    <v-card-title>
      Node Information
      <reload-button :action="load"/>
    </v-card-title>
    <v-divider/>

    <loader :request-state="requestState">
      <v-list v-if="data['version']" class="text--small" dense>
        <v-list-item>
          <v-list-item-content>name</v-list-item-content>
          <v-list-item-content><span class="text-right">{{data['name']}}</span></v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>cluster_name</v-list-item-content>
          <v-list-item-content><span class="text-right">{{data['cluster_name']}}</span></v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>cluster_uuid</v-list-item-content>
          <v-list-item-content><span class="text-right">{{data['cluster_uuid']}}</span></v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>tagline</v-list-item-content>
          <v-list-item-content><span class="text-right">{{data['tagline']}}</span></v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>version.number</v-list-item-content>
          <v-list-item-content><span class="text-right">{{data['version']['number']}}</span>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>version.build_flavor</v-list-item-content>
          <v-list-item-content><span class="text-right">{{data['version']['build_flavor']}}</span>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>version.build_type</v-list-item-content>
          <v-list-item-content><span class="text-right">{{data['version']['build_type']}}</span>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>version.build_hash</v-list-item-content>
          <v-list-item-content><span class="text-right">{{data['version']['build_hash']}}</span>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>version.build_date</v-list-item-content>
          <v-list-item-content><span class="text-right">{{data['version']['build_date']}}</span>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>version.build_snapshot</v-list-item-content>
          <v-list-item-content><span class="text-right">{{data['version']['build_snapshot']}}</span>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>version.lucene_version</v-list-item-content>
          <v-list-item-content><span class="text-right">{{data['version']['lucene_version']}}</span>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>version.minimum_wire_compatibility_version</v-list-item-content>
          <v-list-item-content>
            <span class="text-right">{{data['version']['minimum_wire_compatibility_version']}}</span>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>version.minimum_index_compatibility_version</v-list-item-content>
          <v-list-item-content>
            <span class="text-right">{{data['version']['minimum_index_compatibility_version']}}</span>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </loader>
  </v-card>
</template>

<script>
  import { callApi } from '@/mixins/RequestComposition'
  import ReloadButton from '@/components/shared/ReloadButton'
  import Loader from '@/components/shared/Loader'

  export default {
    name: 'client-information',
    components: {
      ReloadButton,
      Loader
    },
    setup () {
      return callApi('clientInfo')
    }
  }
</script>
