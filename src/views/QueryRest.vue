<template>
  <v-card>
    <v-card-title>
      <v-row>
        <v-col class="py-0">
          <h1 class="headline">
            Rest
            <v-btn class="text-transform--none ml-2" small
                   href="https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html" target="_blank"
                   text>
              <v-icon small>mdi-launch</v-icon>&nbsp;
              api documentation
            </v-btn>
          </h1>
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
      <fetch-form/>
    </v-card-text>
  </v-card>
</template>

<script>
  import FetchForm from '@/components/Query/Rest/FetchForm'
  import { mapVuexAccessors } from '@/helpers/store'

  export default {
    name: 'QueryRest',
    components: {
      FetchForm
    },
    computed: {
      ...mapVuexAccessors('queryRest', ['vertical'])
    }
  }
</script>
