<template>
  <div>
    <v-form @submit.prevent="loadData">
      <v-row>
        <v-col class="py-0" lg="2" sm="3" xl="1">
          <v-select :items="HTTP_METHODS"
                    v-model="method"
                    hide-details
                    label="HTTP Method"
                    name="http_method"/>
        </v-col>
        <v-col class="py-0" lg="10" sm="9" xl="11">
          <v-text-field id="path"
                        v-model="path"
                        autofocus
                        hide-details
                        label="Path"
                        name="path"
                        placeholder="/"/>
        </v-col>
      </v-row>

      <v-row>
        <v-col :md="vertical ? 12 : 6" cols="12">
          <h4 class="pb-1">Request body</h4>
          <resizable-container v-if="canSendBody" ref="query_body"
                               :initial-height="vertical ? 200 : 500"
                               class="mb-1">
            <code-editor :external-commands="editorCommands"
                         :read-only="method === 'GET' || method === 'HEAD'"
                         v-model="stringifiedParams"/>
          </resizable-container>

          <div v-else>
            <v-alert :value="true" color="grey" class="mb-12">
              <p>
                You cannot send a request body via {{method}}.<br>
                Please <a href="javascript:void(0)" role="button" @click="method = 'POST'">select POST</a> as your HTTP
                method or use query parameters in the url.
              </p>
              <p class="mb-0">
                You can use POST to search with the _search endpoint.
              </p>
            </v-alert>
          </div>

          <v-row>
            <v-col :md="vertical ? 6 : 12" cols="12">
              <v-btn id="execute_query" :disabled="!isValid" :loading="loading" class="mx-0" color="primary"
                     type="submit">
                Run query
              </v-btn>
              <a id="reset-form" class="ml-2" href="javascript:void(0)" @click="reset">Reset form</a>
            </v-col>
            <v-col :md="vertical ? 6 : 12" :class="vertical ? 'text-right' : ''" cols="12">
              <a id="example-1" href="javascript:void(0)" @click="loadCatExample">Example #1 (_cat/indices)</a>
              <a id="example-2" class="ml-2" href="javascript:void(0)" @click="loadCreateExample">Example #2 (create
                index)</a>
              <a id="example-3" class="ml-2" href="javascript:void(0)" @click="loadDeleteExample">Example #3 (delete
                index)</a>
            </v-col>
          </v-row>
        </v-col>

        <v-col :md="vertical ? 12 : 6" cols="12">
          <print-pretty :document="response" caption="Response" class="response"/>
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script>
  import ResizableContainer from '@/components/shared/ResizableContainer'
  import PrintPretty from '@/components/shared/PrintPretty'
  import CustomVAutocomplete from '@/components/shared/CustomVAutocomplete'
  import Loading from '@/components/shared/Loading'
  import { HTTP_METHODS, REQUEST_DEFAULT_HEADERS } from '@/consts'
  import { buildFetchAuthHeaderFromUrl, urlWithoutCredentials } from '../../../helpers'
  import { mapVuexAccessors } from '@/helpers/store'

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
        return urlWithoutCredentials(this.url)
      },
      fetchOptionsHash () {
        let fetchOptions = {
          method: this.method,
          headers: Object.assign(buildFetchAuthHeaderFromUrl(this.url), REQUEST_DEFAULT_HEADERS)
        }
        if (this.canSendBody) {
          fetchOptions.body = this.stringifiedParams
        }
        return fetchOptions
      },
      canSendBody () {
        return this.method !== 'GET' && this.method !== 'HEAD'
      },
      ...mapVuexAccessors('queryRest', ['method', 'path', 'stringifiedParams', 'vertical'])
    },
    watch: {
      vertical () {
        if (typeof window === 'undefined') return
        this.$nextTick(() => {
          window.dispatchEvent(new Event('resize'))
        })
      }
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
