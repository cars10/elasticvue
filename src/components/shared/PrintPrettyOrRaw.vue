<template>
  <v-tabs>
    <v-tab key="pretty">Collapsible</v-tab>
    <v-tab key="raw">Raw</v-tab>

    <v-tab-item key="pretty">
      <v-flex pa-3>
        <vue-print-object :printableObject="document"></vue-print-object>
      </v-flex>
    </v-tab-item>

    <v-tab-item key="raw">
      <v-flex pa-3>
        <pre class="scroll-y">{{document}}</pre>
      </v-flex>
    </v-tab-item>
  </v-tabs>
</template>

<script>
  import VuePrintObject from 'vue-print-object'

  export default {
    name: 'PrintPrettyOrRaw',
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
