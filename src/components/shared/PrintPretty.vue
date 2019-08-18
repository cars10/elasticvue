<template>
  <div>
    <v-row>
      <v-col class="my-0 py-0" cols="12" md="9">
        <h2 v-if="caption" class="title">{{caption}}</h2>
      </v-col>
      <v-col class="my-0 py-0" cols="12" md="3">
        <v-btn-toggle v-model="wrapLines" class="float-right v-btn-toggle--small">
          <v-btn :value="true" title="Wrap lines">
            <v-icon>mdi-wrap</v-icon>
          </v-btn>
        </v-btn-toggle>
      </v-col>
    </v-row>
    <div v-if="resizable" class="py-1">
      <resizable-container :initial-height="initialHeight">
        <code-editor :value="document" read-only/>
      </resizable-container>
    </div>
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
