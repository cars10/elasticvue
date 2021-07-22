<template>
  <v-card>
    <v-card-title>
      <v-row>
        <v-col>
          <h1 class="text-h5">
            {{ $t('rest.title') }}
            <v-btn class="text-transform--none ml-2"
                   href="https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html"
                   small target="_blank"
                   text>
              <v-icon small>mdi-launch</v-icon>&nbsp;
              {{ $t('rest.api-documentation') }}
            </v-btn>
          </h1>
        </v-col>

        <v-col class="text-right">
          <v-btn-toggle v-model="vertical" mandatory>
            <v-btn :value="true" small text title="Vertical">
              <v-icon small>mdi-view-agenda</v-icon>
            </v-btn>
            <v-btn :value="false" small text title="Horizontal">
              <v-icon class="mdi-rotate-90" small>mdi-view-agenda</v-icon>
            </v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>
    </v-card-title>
    <v-divider/>
    <v-card-text>
      <rest/>
    </v-card-text>
  </v-card>
</template>

<script>
  import Rest from '@/components/Query/Rest'
  import { vuexAccessors } from '@/helpers/store'

  export default {
    name: 'query-rest',
    components: {
      Rest
    },
    setup () {
      const { vertical } = vuexAccessors('queryRest', ['vertical'])
      return {
        vertical
      }
    }
  }
</script>
