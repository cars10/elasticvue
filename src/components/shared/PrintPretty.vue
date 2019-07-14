<template>
  <div>
    <v-layout>
      <v-flex md9 xs12 my-0>
        <h2 v-if="caption" class="title pt-3">{{caption}}</h2>
      </v-flex>
      <v-flex md3 xs12 my-0 mx-2>
        <v-btn-toggle v-model="wrapLines" class="right">
          <v-btn :value="true" title="Wrap lines">
            <v-icon>mdi-wrap</v-icon>
          </v-btn>
        </v-btn-toggle>
      </v-flex>
    </v-layout>
    <v-flex v-if="resizable" py-2>
      <resizable-container :initial-height="initialHeight">
        <code-editor :value="document" read-only/>
      </resizable-container>
    </v-flex>
    <div v-else :style="style" class="pt-2">
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
        type: null, // any
        default: ''
      },
      initialHeight: {
        type: Number,
        default: 600
      },
      resizable: {
        type: Boolean,
        default: true
      },
      caption: {
        type: String,
        default: ''
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
