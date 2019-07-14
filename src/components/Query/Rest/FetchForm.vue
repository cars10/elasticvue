<template>
  <div>
    <v-form @submit.prevent="loadData">
      <v-layout>
        <v-flex xl1 lg2 sm3 pb-0>
          <v-select v-model="method"
                    :items="HTTP_METHODS"
                    label="HTTP Method"
                    name="http_method"/>
        </v-flex>
        <v-flex xl11 lg10 sm9 pb-0>
          <v-text-field id="path"
                        v-model="path"
                        label="Path"
                        name="path"
                        placeholder="/"
                        autofocus/>
        </v-flex>
      </v-layout>

      <resizable-container :initial-height="150" class="mb-1">
        <code-editor v-model="stringifiedParams" :external-commands="editorCommands"/>
      </resizable-container>

      <v-layout>
        <v-flex>
          <v-btn id="execute_query" :disabled="!isValid" :loading="loading" type="submit" color="primary" class="mx-0">
            Run query
          </v-btn>
          <v-btn href="https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html" target="_blank" text
                 class="text-transform--none ml-2">
            <v-icon small>mdi-launch</v-icon>&nbsp;
            api documentation
          </v-btn>
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
  import ResizableContainer from '@/components/shared/ResizableContainer'
  import PrintPretty from '@/components/shared/PrintPretty'
  import CustomVAutocomplete from '@/components/shared/CustomVAutocomplete'
  import Loading from '@/components/shared/Loading'
  import { HTTP_METHODS } from '../../../consts'
  import qs from 'querystringify'
  import { buildFetchAuthHeaderFromUrl, urlWithoutCredentials } from '../../../helpers'
  import { mapVuexAccessors } from '../../../helpers/store'
  import { REQUEST_DEFAULT_HEADERS } from '@/consts'

  export default {
    name: 'fetch-form',
    components: {
      PrintPretty,
      ResizableContainer,
      CustomVAutocomplete,
      'code-editor': () => ({
        component: import(/* webpackChunkName: "code-editor" */ '@/components/shared/CodeEditor'),
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
      url () {
        if (this.path.slice(0, 1) === '/') {
          return this.$store.state.connection.elasticsearchHost + this.path
        } else {
          return this.$store.state.connection.elasticsearchHost + '/' + this.path
        }
      },
      fetchUrl () {
        let host = urlWithoutCredentials(this.url)
        if (this.stringifiedParams.trim().length !== 0 && (this.method === 'GET' || this.method === 'HEAD')) {
          return host + '?' + qs.stringify(JSON.parse(this.stringifiedParams), '')
        } else {
          return host
        }
      },
      fetchOptionsHash () {
        let fetchOptions = {
          method: this.method,
          headers: Object.assign(buildFetchAuthHeaderFromUrl(this.url), REQUEST_DEFAULT_HEADERS)
        }
        if (this.method !== 'GET' && this.method !== 'HEAD') {
          fetchOptions.body = this.stringifiedParams
        }
        return fetchOptions
      },
      ...mapVuexAccessors('queryRest', ['method', 'path', 'stringifiedParams'])
    },
    created () {
      this.HTTP_METHODS = HTTP_METHODS
      this.editorCommands = [{
        bindKey: { win: 'Ctrl+ENTER', mac: 'Command+ENTER', linux: 'Ctrl+ENTER' },
        exec: this.loadData
      }]
    },
    methods: {
      loadData () {
        this.loading = true
        this.response = '// loading...'
        fetch(this.fetchUrl, this.fetchOptionsHash)
          .then(response => response.json())
          .then(json => {
            this.loading = false
            this.response = json
          })
          .catch(error => {
            this.loading = false
            this.response = error.message
            this.showErrorSnackbar({ text: 'Error.', additionalText: error.message })
          })
      },
      loadCatExample () {
        this.method = 'GET'
        this.stringifiedParams = '{\r\n\t"h": ["health", "index", "docs.count"]\r\n}'
        this.path = '_cat/indices'
      },
      loadCreateExample () {
        this.method = 'PUT'
        this.stringifiedParams = '{\r\n\t"settings": {\r\n\t\t"index": {\r\n\t\t\t"number_of_shards": 3,\r\n\t\t\t"number_of_replicas": 2\r\n\t\t}\r\n\t}\r\n}'
        this.path = 'example_test_index'
      },
      loadDeleteExample () {
        this.method = 'DELETE'
        this.stringifiedParams = '{}'
        this.path = 'example_test_index'
      },
      reset () {
        this.method = 'GET'
        this.stringifiedParams = '{}'
        this.path = ''
        this.response = ''
      }
    }
  }
</script>
