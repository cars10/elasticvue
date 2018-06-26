<template>
  <v-flex py-2>
    <resizable-container :initial-height="600">
      <code-editor readOnly :code="document"></code-editor>
    </resizable-container>
  </v-flex>
</template>

<script>
  import ResizableContainer from '@/components/shared/ResizableContainer'
  import Loading from '@/components/shared/Loading'

  export default {
    name: 'PrintPretty',
    props: {
      document: {
        default: () => {
          return {}
        },
        type: Object
      }
    },
    components: {
      'code-editor': () => ({
        component: import('@/components/shared/CodeEditor'),
        loading: Loading
      }),
      ResizableContainer
    }
  }
</script>
