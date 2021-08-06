<template>
  <div>
    <div class="mb-12">
      <v-btn class="pl-1 mr-2" @click="historyCollapsed = !historyCollapsed">
        <v-icon>{{ historyCollapsed ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
        {{ $t('query.rest.history') }}
      </v-btn>

      <rest-query-examples @setRequest="setRequest"/>
      <v-expand-transition>
        <rest-query-history v-if="historyCollapsed" @setRequest="setRequest"/>
      </v-expand-transition>
    </div>

    <v-form @submit.prevent="loadData">
      <v-row>
        <v-col lg="2" sm="3" xl="1">
          <v-select v-model="method"
                    :items="HTTP_METHODS"
                    :label="$t('query.rest.form.method.label')"
                    hide-details
                    name="http_method"/>
        </v-col>
        <v-col lg="10" sm="9" xl="11">
          <v-text-field id="path"
                        v-model="path"
                        :label="$t('query.rest.form.path.label')"
                        autofocus
                        hide-details
                        name="path"
                        placeholder="/"/>
        </v-col>
      </v-row>

      <v-row>
        <v-col :md="vertical ? 12 : 6" cols="12">
          <resizable-container v-if="canSendBody" :initial-height="vertical ? 200 : 500" class="mb-4">
            <code-editor v-model="requestBody" :external-commands="editorCommands"/>
          </resizable-container>

          <div v-else>
            <div :style="vertical ? 'height: 200px' : 'height: 500px'" class="mb-4">
              <v-alert :value="true" class="request-body-disabled-hint">
                <p>
                  <span v-html="$t('query.rest.get_request_hint.cannot_send_body', { method })"/>
                  <button class="btn-link" type="button" @click="method = 'POST'">
                    {{ $t('query.rest.get_request_hint.use_post') }}
                  </button>
                  {{ $t('query.rest.get_request_hint.query_parameters') }}
                </p>
                <p class="mb-0">
                  {{ $t('query.rest.get_request_hint.search_post') }}
                </p>
              </v-alert>
            </div>
          </div>

          <v-btn id="execute_query" :disabled="!formValid" :loading="loading" class="mx-0" color="primary-button"
                 type="submit">
            {{ $t('query.rest.form.send_request') }}
          </v-btn>
          <v-chip v-if="responseStatus" :class="responseStatusClass" class="ml-2">{{ responseStatus }}</v-chip>

          <br>
          <v-btn id="reset-form" class="mt-2" small text @click="resetForm">
            {{ $t('query.rest.form.reset') }}
          </v-btn>
        </v-col>

        <v-col :md="vertical ? 12 : 6" cols="12">
          <print-pretty :document="responseBody" :focus="false" class="mb-2"/>
          <v-btn :disabled="!responseBody || responseBody.length === 0"
                 :download="downloadFileName"
                 :href="downloadJsonHref"
                 small
                 @click="setDownloadHref">
            {{ $t('query.rest.form.download_as_json') }}
          </v-btn>
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script>
  import store from '@/store'
  import ResizableContainer from '@/components/shared/ResizableContainer'
  import PrintPretty from '@/components/shared/PrintPretty'
  import { HTTP_METHODS, IDB_TABLE_NAMES, REQUEST_DEFAULT_HEADERS } from '@/consts'
  import { buildFetchAuthHeader } from '@/helpers'
  import { vuexAccessors } from '@/helpers/store'
  import { computed, ref } from '@vue/composition-api'
  import { showErrorSnackbar } from '@/mixins/ShowSnackbar'
  import { parseJsonBigInt } from '@/helpers/json_parse'
  import { useIdb } from '@/services/IdbConnection'
  import RestQueryHistory from '@/components/Query/RestQueryHistory'
  import RestQueryExamples from '@/components/Query/RestQueryExamples'

  export default {
    name: 'rest',
    components: {
      PrintPretty,
      RestQueryHistory,
      ResizableContainer,
      RestQueryExamples,
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
      const responseBody = ref('')
      const responseStatus = ref(null)

      const canSendBody = computed(() => {
        return method.value !== 'GET' && method.value !== 'HEAD'
      })

      const formValid = computed(() => !!method.value)
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

      const { connection } = useIdb(IDB_TABLE_NAMES.REST)
      const setupDb = async () => await connection.initialize()
      setupDb()

      const loadData = () => {
        loading.value = true
        responseBody.value = '{"loading": true}'
        responseStatus.value = ''
        fetch(requestUrl.value, fetchOptionsHash())
          .then(response => {
            responseStatus.value = response.status + ' ' + response.statusText
            return response.text()
          })
          .then(text => {
            loading.value = false
            if (text) {
              responseBody.value = parseJsonBigInt(text)
            } else {
              responseBody.value = ''
            }
            if (responseStatus.value.toString().match(/^2\d\d/)) {
              connection.dbInsert({
                method: method.value,
                path: path.value,
                body: canSendBody.value ? requestBody.value : undefined,
                favorite: 0,
                date: new Date()
              })
            }
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

      const resetForm = () => {
        method.value = HTTP_METHODS[1]
        requestBody.value = '{}'
        path.value = ''
        responseBody.value = ''
        responseStatus.value = ''
      }

      const setRequest = item => {
        method.value = item.method
        requestBody.value = item.body
        path.value = item.path
        responseBody.value = ''
        responseStatus.value = ''
      }

      const responseStatusClass = computed(() => {
        if (!responseStatus.value || responseStatus.value.length === 0) return 'grey'

        if (responseStatus.value.match(/^2/)) {
          return 'green black--text'
        } else if (responseStatus.value.match(/^3|4/)) {
          return 'darken-2 yellow black--text'
        } else if (responseStatus.value.match(/^5/)) {
          return 'red black--text'
        }

        return 'grey'
      })

      const historyCollapsed = ref(false)

      const downloadJsonHref = ref('#')
      const downloadFileName = computed(() => {
        return `${method.value.toLowerCase()}_${path.value.replace(/[\W_]+/g, '_')}.json`
      })
      const setDownloadHref = () => {
        const value = typeof responseBody.value === 'string' ? responseBody.value : JSON.stringify(responseBody.value)
        downloadJsonHref.value = `data:application/json,${encodeURIComponent(value)}`
      }

      return {
        loading,
        responseBody,
        responseStatus,
        vertical,
        path,
        method,
        requestBody,
        HTTP_METHODS,
        editorCommands,
        canSendBody,
        formValid,
        loadData,
        resetForm,
        setRequest,
        responseStatusClass,
        historyCollapsed,
        downloadFileName,
        downloadJsonHref,
        setDownloadHref
      }
    }
  }
</script>
