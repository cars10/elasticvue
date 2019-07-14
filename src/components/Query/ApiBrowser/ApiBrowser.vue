<template>
  <div>
    <v-form @submit.prevent="loadData">
      <v-flex d-inline-flex pa-0>
        <custom-v-autocomplete v-model="method"
                               :items="ES_METHODS"
                               label="Method"
                               name="Method"
                               item-text="name"
                               item-value="name">
          <template v-slot:item="data">
            {{data.item.name}}
          </template>
        </custom-v-autocomplete>
      </v-flex>

      <v-btn :href="apiDocumentationUrl" target="_blank" text
             class="text-transform--none ml-2">
        <v-icon small>mdi-launch</v-icon>&nbsp;
        open {{method}} documentation
      </v-btn>

      <resizable-container :initial-height="200" class="mb-1">
        <code-editor v-model="stringifiedParams" :external-commands="editorCommands"/>
      </resizable-container>

      <v-layout>
        <v-flex>
          <v-btn :disabled="!isValid" :loading="loading" type="submit" color="primary" class="mx-0">Run query</v-btn>
        </v-flex>
        <v-flex class="text-xs-right">
          <a href="javascript:void(0)" @click="loadCatExample">Example #1 (_cat/indices)</a>
          <a href="javascript:void(0)" class="ml-2" @click="loadCreateExample">Example #2 (create index)</a>
          <a href="javascript:void(0)" class="ml-2" @click="loadDeleteExample">Example #3 (delete index)</a>
          <a href="javascript:void(0)" class="ml-2" @click="reset">Reset</a>
        </v-flex>
      </v-layout>
    </v-form>

    <print-pretty :document="response" caption="Response"/>
  </div>
</template>

<script>
  import PrintPretty from '@/components/shared/PrintPretty'
  import CustomVAutocomplete from '@/components/shared/CustomVAutocomplete'
  import Loading from '@/components/shared/Loading'
  import ResizableContainer from '@/components/shared/ResizableContainer'
  import { API_DOC_URL } from '@/consts'
  import { mapVuexAccessors } from '@/helpers/store'
  import { showErrorSnackbar } from '@/mixins/ShowSnackbar'
  import esAdapter from '@/mixins/GetAdapter'

  export default {
    name: 'js-api-form',
    components: {
      PrintPretty,
      ResizableContainer,
      CustomVAutocomplete,
      'code-editor': () => ({
        component: import('@/components/shared/CodeEditor'),
        loading: Loading
      })
    },
    data () {
      return {
        loading: false,
        response: {}
      }
    },
    computed: {
      isValid () {
        return !!this.method && this.paramsValid
      },
      paramsValid () {
        if (this.stringifiedParams.trim().length === 0) return true

        try {
          JSON.parse(this.stringifiedParams)
          return true
        } catch (error) {
          return false
        }
      },
      apiDocumentationUrl () {
        if (this.method) {
          return API_DOC_URL + `#_${this.method.replace('.', '_').toLowerCase()}`
        } else {
          return API_DOC_URL
        }
      },
      parsedParams () {
        if (this.stringifiedParams.trim().length === 0) return {}
        return Object.assign({}, JSON.parse(this.stringifiedParams), { format: 'json' })
      },
      ...mapVuexAccessors('queryApiBrowser', ['method', 'stringifiedParams'])
    },
    created () {
      this.ES_METHODS = [{ 'header': 'general' }, { 'name': 'bulk' }, { 'name': 'clearScroll' }, { 'name': 'count' }, { 'name': 'create' }, { 'name': 'delete' }, { 'name': 'deleteByQuery' }, { 'name': 'deleteByQueryRethrottle' }, { 'name': 'deleteScript' }, { 'name': 'exists' }, { 'name': 'existsSource' }, { 'name': 'explain' }, { 'name': 'fieldCaps' }, { 'name': 'get' }, { 'name': 'getScript' }, { 'name': 'getSource' }, { 'name': 'index' }, { 'name': 'info' }, { 'name': 'mget' }, { 'name': 'msearch' }, { 'name': 'msearchTemplate' }, { 'name': 'mtermvectors' }, { 'name': 'ping' }, { 'name': 'putScript' }, { 'name': 'rankEval' }, { 'name': 'reindex' }, { 'name': 'reindexRethrottle' }, { 'name': 'renderSearchTemplate' }, { 'name': 'scriptsPainlessExecute' }, { 'name': 'scroll' }, { 'name': 'search' }, { 'name': 'searchShards' }, { 'name': 'searchTemplate' }, { 'name': 'termvectors' }, { 'name': 'update' }, { 'name': 'updateByQuery' }, { 'name': 'updateByQueryRethrottle' }, { 'header': 'cat' }, { 'name': 'cat.aliases' }, { 'name': 'cat.allocation' }, { 'name': 'cat.count' }, { 'name': 'cat.fielddata' }, { 'name': 'cat.health' }, { 'name': 'cat.help' }, { 'name': 'cat.indices' }, { 'name': 'cat.master' }, { 'name': 'cat.nodeattrs' }, { 'name': 'cat.nodes' }, { 'name': 'cat.pendingTasks' }, { 'name': 'cat.plugins' }, { 'name': 'cat.recovery' }, { 'name': 'cat.repositories' }, { 'name': 'cat.segments' }, { 'name': 'cat.shards' }, { 'name': 'cat.snapshots' }, { 'name': 'cat.tasks' }, { 'name': 'cat.templates' }, { 'name': 'cat.threadPool' }, { 'header': 'close' }, { 'name': 'close.constructor' }, { 'name': 'close.apply' }, { 'name': 'close.bind' }, { 'name': 'close.call' }, { 'name': 'close.toString' }, { 'header': 'cluster' }, { 'name': 'cluster.allocationExplain' }, { 'name': 'cluster.getSettings' }, { 'name': 'cluster.health' }, { 'name': 'cluster.pendingTasks' }, { 'name': 'cluster.putSettings' }, { 'name': 'cluster.remoteInfo' }, { 'name': 'cluster.reroute' }, { 'name': 'cluster.state' }, { 'name': 'cluster.stats' }, { 'header': 'indices' }, { 'name': 'indices.analyze' }, { 'name': 'indices.clearCache' }, { 'name': 'indices.close' }, { 'name': 'indices.create' }, { 'name': 'indices.delete' }, { 'name': 'indices.deleteAlias' }, { 'name': 'indices.deleteTemplate' }, { 'name': 'indices.exists' }, { 'name': 'indices.existsAlias' }, { 'name': 'indices.existsTemplate' }, { 'name': 'indices.existsType' }, { 'name': 'indices.flush' }, { 'name': 'indices.flushSynced' }, { 'name': 'indices.forcemerge' }, { 'name': 'indices.get' }, { 'name': 'indices.getAlias' }, { 'name': 'indices.getFieldMapping' }, { 'name': 'indices.getMapping' }, { 'name': 'indices.getSettings' }, { 'name': 'indices.getTemplate' }, { 'name': 'indices.getUpgrade' }, { 'name': 'indices.open' }, { 'name': 'indices.putAlias' }, { 'name': 'indices.putMapping' }, { 'name': 'indices.putSettings' }, { 'name': 'indices.putTemplate' }, { 'name': 'indices.recovery' }, { 'name': 'indices.refresh' }, { 'name': 'indices.rollover' }, { 'name': 'indices.segments' }, { 'name': 'indices.shardStores' }, { 'name': 'indices.shrink' }, { 'name': 'indices.split' }, { 'name': 'indices.stats' }, { 'name': 'indices.updateAliases' }, { 'name': 'indices.upgrade' }, { 'name': 'indices.validateQuery' }, { 'header': 'ingest' }, { 'name': 'ingest.deletePipeline' }, { 'name': 'ingest.getPipeline' }, { 'name': 'ingest.processorGrok' }, { 'name': 'ingest.putPipeline' }, { 'name': 'ingest.simulate' }, { 'header': 'nodes' }, { 'name': 'nodes.hotThreads' }, { 'name': 'nodes.info' }, { 'name': 'nodes.reloadSecureSettings' }, { 'name': 'nodes.stats' }, { 'name': 'nodes.usage' }, { 'header': 'snapshot' }, { 'name': 'snapshot.create' }, { 'name': 'snapshot.createRepository' }, { 'name': 'snapshot.delete' }, { 'name': 'snapshot.deleteRepository' }, { 'name': 'snapshot.get' }, { 'name': 'snapshot.getRepository' }, { 'name': 'snapshot.restore' }, { 'name': 'snapshot.status' }, { 'name': 'snapshot.verifyRepository' }, { 'header': 'tasks' }, { 'name': 'tasks.cancel' }, { 'name': 'tasks.get' }, { 'name': 'tasks.list' }, { 'header': 'transport' }, { 'name': 'transport.constructor' }, { 'name': 'transport.defer' }, { 'name': 'transport.request' }, { 'name': 'transport._timeout' }, { 'name': 'transport.sniff' }, { 'name': 'transport.setHosts' }, { 'name': 'transport.close' }]
      this.editorCommands = [{
        bindKey: { win: 'Ctrl+ENTER', mac: 'Command+ENTER', linux: 'Ctrl+ENTER' },
        exec: this.loadData
      }]
    },
    methods: {
      loadData () {
        this.loading = true
        this.response = '// loading...'
        esAdapter().then(adapter => {
          const methodSplit = this.method.split('.')
          if (methodSplit.length === 1) {
            return adapter.client[methodSplit](this.parsedParams)
          } else {
            return adapter.client[methodSplit[0]][methodSplit[1]](this.parsedParams)
          }
        }).then(response => {
          this.loading = false
          this.response = response
        }).catch(error => {
          this.loading = false
          this.response = error.message
          showErrorSnackbar({ text: 'Error:', additionalText: error.message })
        })
      },
      loadCatExample () {
        this.method = 'cat.indices'
        this.stringifiedParams = '{\r\n\t"h": ["health", "index", "docs.count"]\r\n}'
      },
      loadCreateExample () {
        this.method = 'indices.create'
        this.stringifiedParams = '{\r\n\t"index": "example_test_index",\r\n\t"body": {\r\n\t\t"settings": {\r\n\t\t\t"index": {\r\n\t\t\t\t"number_of_shards": 3,\r\n\t\t\t\t"number_of_replicas": 2\r\n\t\t\t}\r\n\t\t}\r\n\t}\r\n}'
      },
      loadDeleteExample () {
        this.method = 'indices.delete'
        this.stringifiedParams = '{\r\n\t"index": "example_test_index"\r\n}'
      },
      reset () {
        this.method = 'info'
        this.stringifiedParams = '{}'
        this.response = ''
      }
    }
  }
</script>
