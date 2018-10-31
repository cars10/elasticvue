<template>
  <div>
    <div class="clearfix">
      <v-flex right>
        <v-btn-toggle v-model="wrapLines" class="ma-2">
          <v-btn :value="true" title="Wrap lines">
            <v-icon>wrap_text</v-icon>
          </v-btn>
        </v-btn-toggle>
      </v-flex>
    </div>
    <v-flex v-if="resizable" py-2>
      <resizable-container :initial-height="initialHeight">
        <code-editor :value="document" read-only/>
      </resizable-container>
    </v-flex>
    <div v-else :style="style">
      <code-editor :value="document" :wrap-lines="wrapLines" read-only/>
    </div>
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
    data () {
      return {
        wrapLines: true
      }
    },
    computed: {
      style () {
        return `height: ${this.initialHeight}px`
      }
    }
  }
</script>
