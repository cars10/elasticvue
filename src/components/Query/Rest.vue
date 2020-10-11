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
          <h4 class="pb-1">Request body <span v-if="!canSendBody">(disabled)</span></h4>
          <resizable-container v-if="canSendBody" ref="query_body"
                               :initial-height="vertical ? 200 : 500"
                               class="mb-1">
            <code-editor :external-commands="editorCommands"
                         :read-only="method === 'GET' || method === 'HEAD'"
                         v-model="requestBody"/>
          </resizable-container>

          <div v-else>
            <div :style="vertical ? 'height: 200px' : 'height: 500px'">
              <v-alert :value="true" class="request-body-disabled-hint mb-12">
                <p>
                  You cannot send a request body via {{ method }}.<br>
                  Please <a href="javascript:void(0)" role="button" @click="method = 'POST'">use POST</a>
                  if you want to send a request body, alternatively add query parameters to the url.
                </p>
                <p class="mb-0">
                  You can use POST to search with the _search endpoint.
                </p>
              </v-alert>
            </div>
          </div>

          <v-row>
            <v-col :md="vertical ? 6 : 12" cols="12">
              <v-btn id="execute_query" :disabled="!formValid" :loading="loading" class="mx-0" color="primary"
                     type="submit">
                Run query
              </v-btn>
              <a id="reset-form" class="ml-2" href="javascript:void(0)" @click="resetForm">Reset form</a>
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
          <print-pretty :document="responseBody" :caption="responseCaption" class="response"/>
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script>
  import store from '@/store'
  import ResizableContainer from '@/components/shared/ResizableContainer'
  import PrintPretty from '@/components/shared/PrintPretty'
  import { HTTP_METHODS, REQUEST_DEFAULT_HEADERS } from '@/consts'
  import { buildFetchAuthHeaderFromUrl, urlWithoutCredentials } from '../../helpers'
  import { compositionVuexAccessors } from '@/helpers/store'
  import { computed, ref } from '@vue/composition-api'
  import { showErrorSnackbar } from '@/mixins/ShowSnackbar'

  export default {
    name: 'rest',
    components: {
      PrintPretty,
      ResizableContainer,
      'code-editor': () => ({
        component: import(/* webpackChunkName: "code-editor" */ '@/components/shared/CodeEditor')
      })
    },
    setup () {
      const { method, path, requestBody, vertical } = compositionVuexAccessors('queryRest', ['method', 'path', 'requestBody', 'vertical'])
      const loading = ref(false)
      const responseBody = ref({})
      const responseCode = ref(null)
      const responseCaption = computed(() => {
        if (responseCode.value) {
          return `Result (Statuscode: ${responseCode.value})`
        } else {
          return 'Result'
        }
      })

      const canSendBody = computed(() => {
        return method.value !== 'GET' && method.value !== 'HEAD'
      })

      const formValid = computed(() => {
        return !!method.value && requestBodyValid.value
      })

      const requestBodyValid = computed(() => {
        if (requestBody.value.trim().length === 0) return true

        try {
          JSON.parse(requestBody.value)
          return true
        } catch (error) {
          return false
        }
      })

      const requestUrl = computed(() => {
        if (path.value.slice(0, 1) === '/') {
          return store.getters['connection/activeInstance'].uri + path.value
        } else {
          return store.getters['connection/activeInstance'].uri + '/' + path.value
        }
      })

      const fetchOptionsHash = () => {
        let fetchOptions = {
          method: method.value,
          headers: Object.assign(buildFetchAuthHeaderFromUrl(requestUrl.value), REQUEST_DEFAULT_HEADERS)
        }
        if (canSendBody.value) {
          fetchOptions.body = requestBody.value
        }
        return fetchOptions
      }

      const loadData = () => {
        loading.value = true
        responseBody.value = '// loading...'
        responseCode.value = ''
        fetch(urlWithoutCredentials(requestUrl.value), fetchOptionsHash())
          .then(response => {
            responseCode.value = response.status
            return response.json()
          })
          .then(json => {
            loading.value = false
            responseBody.value = json
          })
          .catch(error => {
            loading.value = false
            responseBody.value = error.message
            showErrorSnackbar({ text: 'Error.', additionalText: error.message })
          })
      }

      const editorCommands = [{
        bindKey: { win: 'Ctrl+ENTER', mac: 'Command+ENTER', linux: 'Ctrl+ENTER' },
        exec: loadData
      }]

      const loadCatExample = () => {
        method.value = 'GET'
        requestBody.value = '{\r\n\t"h": ["health", "index", "docs.count"]\r\n}'
        path.value = '_cat/indices'
        responseBody.value = ''
        responseCode.value = ''
      }

      const loadCreateExample = () => {
        method.value = 'PUT'
        requestBody.value = '{\r\n\t"settings": {\r\n\t\t"index": {\r\n\t\t\t"number_of_shards": 3,\r\n\t\t\t"number_of_replicas": 2\r\n\t\t}\r\n\t}\r\n}'
        path.value = 'example_test_index'
        responseBody.value = ''
        responseCode.value = ''
      }

      const loadDeleteExample = () => {
        method.value = 'DELETE'
        requestBody.value = '{}'
        path.value = 'example_test_index'
        responseBody.value = ''
        responseCode.value = ''
      }

      const resetForm = () => {
        method.value = 'GET'
        requestBody.value = '{}'
        path.value = ''
        responseBody.value = ''
        responseCode.value = ''
      }

      return {
        loading,
        responseBody,
        responseCaption,
        vertical,
        path,
        method,
        requestBody,
        HTTP_METHODS,
        editorCommands,
        canSendBody,
        formValid,
        loadData,
        loadCatExample,
        loadCreateExample,
        loadDeleteExample,
        resetForm
      }
    }
  }
</script>
