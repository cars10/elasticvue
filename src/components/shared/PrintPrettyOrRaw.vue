<template>
  <v-tabs>
    <v-tab key="pretty">Collapsible</v-tab>
    <v-tab key="raw">Raw</v-tab>

    <v-tab-item key="pretty">
      <v-flex pa-3>
        <div style="height: 800px; width: 100%">
          <code-editor readOnly :code="document"></code-editor>
        </div>
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
  import Loading from '@/components/shared/Loading'

  export default {
    name: 'PrintPrettyOrRaw',
    props: {
      document: {
        default: () => {
        }
      }
    },
    components: {
      'code-editor': () => ({
        component: import('@/components/shared/CodeEditor'),
        loading: Loading
      })
    }
  }
</script>
