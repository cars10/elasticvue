<template>
  <v-flex py-2>
    <resizable-container :initial-height="initialHeight">
      <code-editor :value="document" :use-worker="false" read-only/>
    </resizable-container>
  </v-flex>
</template>

<script>
  import ResizableContainer from '@/components/shared/ResizableContainer'
  import Loading from '@/components/shared/Loading'

  export default {
    name: 'PrintPretty',
    components: {
      'code-editor': () => ({
        component: import(/* webpackChunkName: "code-editor" */ '@/components/shared/CodeEditor'),
        loading: Loading
      }),
      ResizableContainer
    },
    props: {
      document: {
        default: () => {
          return {}
        },
        type: [Object, Array]
      },
      initialHeight: {
        default: 600,
        type: Number
      }
    }
  }
</script>
