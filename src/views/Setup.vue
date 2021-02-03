<template>
  <v-row>
    <v-col lg="10" offset-lg="1" offset-xl="2" xl="8">
      <v-card>
        <v-card-title>
          <h1 class="text-h5">Setup</h1>
        </v-card-title>

        <v-divider/>

        <template v-if="enableCorsHint">
          <v-card-text>
            <h2 class="text-h6 mb-2">1. Configure</h2>
            <configure/>
          </v-card-text>

          <v-divider/>
        </template>

        <v-card-text>
          <h2 v-if="enableCorsHint" class="text-h6 mb-1">2. Connect</h2>
          <test-and-connect/>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
  import Configure from '@/components/Setup/Configure'
  import TestAndConnect from '@/components/Setup/TestAndConnect'

  export default {
    name: 'setup',
    components: {
      Configure,
      TestAndConnect
    },
    setup () {
      return {
        enableCorsHint: process.env.VUE_APP_DISABLE_CORS_HINT !== 'true'
      }
    }
  }
</script>
