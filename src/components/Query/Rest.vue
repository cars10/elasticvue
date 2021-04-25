<template>
  <div>
    <v-form @submit.prevent="loadData">
      <v-row>
        <v-col lg="2" sm="3" xl="1">
          <v-select v-model="method"
                    :items="HTTP_METHODS"
                    hide-details
                    label="HTTP Method"
                    name="http_method"/>
        </v-col>
        <v-col lg="10" sm="9" xl="11">
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
                               class="mb-4">
            <code-editor v-model="requestBody" :external-commands="editorCommands"/>
          </resizable-container>

          <div v-else>
            <div :style="vertical ? 'height: 200px' : 'height: 500px'" class="mb-4">
              <v-alert :value="true" class="request-body-disabled-hint">
                <p>
                  You cannot send a request body via {{ method }}.<br>
                  Please
                  <button class="btn-link" type="button" @click="method = 'POST'">use POST</button>
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
              <v-btn id="execute_query" :disabled="!formValid" :loading="loading" class="mx-0" color="primary-button"
                     type="submit">
                Run query
              </v-btn>
              <button id="reset-form" type="button" class="btn-link ml-2" @click="resetForm">Reset form</button>
            </v-col>
            <v-col :class="vertical ? 'text-right' : ''" :md="vertical ? 6 : 12" cols="12">
              <button id="example-1" type="button" class="btn-link" @click="loadCatExample">Example #1 (_cat/indices)
              </button>
              <button id="example-2" type="button" class="btn-link ml-2" @click="loadCreateExample">
                Example #2 (create index)
              </button>
              <button id="example-3" type="button" class="btn-link ml-2" @click="loadDeleteExample">
                Example #3 (delete index)
              </button>
            </v-col>
          </v-row>
        </v-col>

        <v-col :md="vertical ? 12 : 6" cols="12">
          <print-pretty :caption="responseCaption" :document="responseBody" class="response mb-4"/>
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
  import { buildFetchAuthHeader } from '@/helpers'
  import { compositionVuexAccessors } from '@/helpers/store'
  import { computed, ref } from '@vue/composition-api'
  import { showErrorSnackbar } from '@/mixins/ShowSnackbar'
  import { parseJsonBigInt } from '@/helpers/json_parse'

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
      const {
        method,
        path,
        requestBody,
        vertical
      } = compositionVuexAccessors('queryRest', ['method', 'path', 'requestBody', 'vertical'])
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
        return !!method.value
      })

      const instance = store.getters['connection/activeInstance']

      const requestUrl = computed(() => {
        if (path.value.slice(0, 1) === '/') {
          return instance.uri + path.value
        } else {
          return instance.uri + '/' + path.value
        }
      })

      const fetchOptionsHash = () => {
        const fetchOptions = {
          method: method.value,
          headers: Object.assign({}, REQUEST_DEFAULT_HEADERS)
        }

        if (instance.username.length > 0) {
          fetchOptions.headers.Authorization = buildFetchAuthHeader(instance.username, instance.password)
        }

        if (canSendBody.value) {
          fetchOptions.body = requestBody.value
        }
        return fetchOptions
      }

      const loadData = () => {
        loading.value = true
        responseBody.value = '{"loading": true}'
        responseCode.value = ''
        fetch(requestUrl.value, fetchOptionsHash())
          .then(response => {
            responseCode.value = response.status
            return response.text()
          })
          .then(text => {
            loading.value = false
            responseBody.value = parseJsonBigInt(text)
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
