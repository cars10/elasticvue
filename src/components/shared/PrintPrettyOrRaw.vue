<template>
  <v-tabs>
    <v-tab key="tab1">Collapsible</v-tab>
    <v-tab key="tab2">Raw</v-tab>

    <v-tab-item key="tab1">
      <v-flex pa-3>
        <vue-print-object :printableObject="document"></vue-print-object>
      </v-flex>
    </v-tab-item>

    <v-tab-item key="tab2">
      <v-flex pa-3>
        <pre class="scroll-y">{{document}}</pre>
      </v-flex>
    </v-tab-item>
  </v-tabs>
</template>

<script>
  import VuePrintObject from 'vue-print-object'

  export default {
    props: {
      document: {
        default: () => {}
      }
    },
    components: {
      VuePrintObject
    }
  }
</script>
