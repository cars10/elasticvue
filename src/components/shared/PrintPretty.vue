<template>
  <v-flex v-if="resizable" py-2>
    <resizable-container :initial-height="initialHeight">
      <code-editor :value="document" :use-worker="false" read-only/>
    </resizable-container>
  </v-flex>
  <div v-else :style="style">
    <code-editor :value="document" :use-worker="false" read-only/>
  </div>
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
        default: '',
        type: [Object, Array, String]
      },
      initialHeight: {
        default: 600,
        type: Number
      },
      resizable: {
        default: true,
        type: Boolean
      }
    },
    computed: {
      style () {
        return `height: ${this.initialHeight}px`
      }
    }
  }
</script>
