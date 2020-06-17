<template>
  <v-card>
    <v-card-title>
      <v-row>
        <v-col class="py-0">
          <h1 class="text-h5">API Browser</h1>
        </v-col>
        <v-col class="text-right py-0">
          <v-btn-toggle v-model="vertical" mandatory>
            <v-btn :value="true" text title="Vertical" small>
              <v-icon small>mdi-view-agenda</v-icon>
            </v-btn>
            <v-btn :value="false" text title="Horizontal" small>
              <v-icon small class="mdi-rotate-90">mdi-view-agenda</v-icon>
            </v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>
    </v-card-title>
    <v-divider/>
    <v-card-text>
      <api-browser/>
    </v-card-text>
  </v-card>
</template>

<script>
  import ApiBrowser from '@/components/Query/ApiBrowser/ApiBrowser'
  import { mapVuexAccessors } from '@/helpers/store'

  export default {
    name: 'QueryApiBrowser',
    components: {
      ApiBrowser
    },
    computed: {
      ...mapVuexAccessors('queryApiBrowser', ['vertical'])
    }
  }
</script>
