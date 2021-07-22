<template>
  <div>
    <v-form @submit.prevent="loadData">
      <v-row>
        <v-col lg="2" sm="3" xl="1">
          <v-select v-model="method"
                    :items="HTTP_METHODS"
                    hide-details
                    :label="$t('rest.http-method')"
                    name="http_method"/>
        </v-col>
        <v-col lg="10" sm="9" xl="11">
          <v-text-field id="path"
                        v-model="path"
                        autofocus
                        hide-details
                        :label="$t('rest.path')"
                        name="path"
                        placeholder="/"/>
        </v-col>
      </v-row>

      <v-row>
        <v-col :md="vertical ? 12 : 6" cols="12">
          <h4 class="pb-1">{{ $t('rest.request-body') }} <span v-if="!canSendBody">({{ $t('rest.disabled') }})</span></h4>
          <resizable-container v-if="canSendBody" ref="query_body"
                               :initial-height="vertical ? 200 : 500"
                               class="mb-4">
            <code-editor v-model="requestBody" :external-commands="editorCommands"/>
          </resizable-container>

          <div v-else>
            <div :style="vertical ? 'height: 200px' : 'height: 500px'" class="mb-4">
              <v-alert :value="true" class="request-body-disabled-hint">
                <p>
                  {{ $t('rest.hint-part-1', {method: method}) }}
                  <button class="btn-link" type="button" @click="method = 'POST'">{{ $t('rest.hint-part-2') }}</button>
                  {{ $t('rest.hint-part-3') }}
                </p>
                <p class="mb-0">
                  {{ $t('rest.hint-part-4') }}
                </p>
              </v-alert>
            </div>
          </div>

          <v-row>
            <v-col :md="vertical ? 6 : 12" cols="12">
              <v-btn id="execute_query" :disabled="!formValid" :loading="loading" class="mx-0" color="primary-button"
                     type="submit">
                {{ $t('rest.execute-query') }}
              </v-btn>
              <button id="reset-form" type="button" class="btn-link ml-2" @click="resetForm">{{ $t('rest.reset-form') }}</button>
            </v-col>
            <v-col :class="vertical ? 'text-right' : ''" :md="vertical ? 6 : 12" cols="12">
              <button id="example-1" type="button" class="btn-link" @click="loadCatExample">{{ $t('rest.example-1') }}
              </button>
              <button id="example-2" type="button" class="btn-link ml-2" @click="loadCreateExample">
                {{ $t('rest.example-2') }}
              </button>
              <button id="example-3" type="button" class="btn-link ml-2" @click="loadDeleteExample">
                {{ $t('rest.example-3') }}
              </button>
            </v-col>
          </v-row>
        </v-col>

        <v-col :md="vertical ? 12 : 6" cols="12">
          <print-pretty :caption="responseCaption" :document="responseBody" :focus="false" class="response mb-4"/>
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script>
  import store from '@/store'
  import i18n from '@/i18n'
  import ResizableContainer from '@/components/shared/ResizableContainer'
  import PrintPretty from '@/components/shared/PrintPretty'
  import { HTTP_METHODS, REQUEST_DEFAULT_HEADERS } from '@/consts'
  import { buildFetchAuthHeader } from '@/helpers'
  import { vuexAccessors } from '@/helpers/store'
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
      } = vuexAccessors('queryRest', ['method', 'path', 'requestBody', 'vertical'])
      const loading = ref(false)
      const responseBody = ref({})
      const responseCode = ref(null)
      const responseCaption = computed(() => {
        if (responseCode.value) {
          return i18n.t('rest.result-code', {code: responseCode.value})
        } else {
          return i18n.t('rest.result')
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
