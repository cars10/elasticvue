<template>
  <v-row>
    <v-col lg="10" offset-lg="1" offset-xl="2" xl="8">
      <v-card>
        <v-card-title>
          <h1 class="text-h5">{{ $t('setup.heading') }}</h1>
        </v-card-title>

        <v-divider/>

        <template v-if="SHOW_CORS_HINT">
          <v-card-text>
            <h2 class="text-h6 mb-2">{{ $t('setup.configure.heading') }}</h2>
            <configure/>
          </v-card-text>

          <v-divider/>
        </template>

        <v-card-text>
          <h2 v-if="SHOW_CORS_HINT" class="text-h6 mb-1">{{ $t('setup.test_and_connect.heading') }}</h2>
          <test-and-connect/>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
  import Configure from '@/components/Setup/Configure'
  import TestAndConnect from '@/components/Setup/TestAndConnect'
  import { SHOW_CORS_HINT } from '@/consts'

  export default {
    name: 'setup',
    components: {
      Configure,
      TestAndConnect
    },
    setup () {
      return {
        SHOW_CORS_HINT
      }
    }
  }
</script>
