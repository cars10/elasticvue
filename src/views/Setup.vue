<template>
  <v-row>
    <v-col lg="10" offset-lg="1" offset-xl="2" xl="8">
      <v-card>
        <v-card-title>
          <h1 class="headline">Setup</h1>
        </v-card-title>

        <v-divider/>

        <v-card-text>
          <configure/>
        </v-card-text>

        <v-divider/>

        <v-card-text>
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
    }
  }
</script>
