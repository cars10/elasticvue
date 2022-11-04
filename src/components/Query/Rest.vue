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
          <v-select v-model="request.method"
                    :items="HTTP_METHODS"
                    :label="$t('query.rest.form.method.label')"
                    hide-details
                    name="http_method"/>
        </v-col>
        <v-col lg="10" sm="9" xl="11">
          <v-text-field id="path"
                        v-model="request.path"
                        :label="$t('query.rest.form.path.label')"
                        autofocus
                        hide-details
                        name="path"
                        placeholder="/"/>
        </v-col>
      </v-row>

      <v-row>
        <v-col :md="vertical ? 12 : 6" cols="12">
          <div class="py-1">
            <resizable-container v-if="canSendBody" :initial-height="vertical ? 200 : 500" class="mb-4">
              <code-editor v-model="request.body" :external-commands="editorCommands"/>
            </resizable-container>

            <div v-else>
              <div :style="vertical ? 'height: 200px' : 'height: 500px'" class="mb-4">
                <v-alert :value="true" class="request-body-disabled-hint">
                  <p>
                    <span v-html="$t('query.rest.get_request_hint.cannot_send_body', { method: request.method })"/>
                    <button class="btn-link" type="button" @click=" request.method  = 'POST'">
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
          </div>

          <v-btn id="execute_query" :loading="loading" class="mx-0" color="primary-button" type="submit">
            {{ $t('query.rest.form.send_request') }}
          </v-btn>
          <v-chip v-if="response.status" :class="responseStatusClass" class="ml-2">{{ response.status }}</v-chip>

          <br>
          <v-btn id="reset-form" class="mt-2" small text @click="reset">
            {{ $t('query.rest.form.reset') }}
          </v-btn>
        </v-col>

        <v-col :md="vertical ? 12 : 6" cols="12">
          <print-pretty :document="response.body" :focus="false" class="mb-2"/>
          <download-button small
                           :download="downloadFileName"
                           :text="$t('query.rest.form.download_as_json')"
                           :disabled="!response.body || response.body.length === 0"
                           :generateDownloadData="generateDownloadData"/>
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script>
  import ResizableContainer from '@/components/shared/ResizableContainer'
  import PrintPretty from '@/components/shared/PrintPretty'
  import { HTTP_METHODS } from '@/consts'
  import { computed, ref } from 'vue'
  import RestQueryHistory from '@/components/Query/RestQueryHistory'
  import RestQueryExamples from '@/components/Query/RestQueryExamples'
  import { useRestQuery } from '@/mixins/RestQuery'
  import { vuexAccessors } from '@/helpers/store'
  import store from '@/store'
  import DownloadButton from '@/components/shared/DownloadButton'

  export default {
    name: 'rest',
    components: {
      DownloadButton,
      PrintPretty,
      RestQueryHistory,
      ResizableContainer,
      RestQueryExamples,
      'code-editor': () => ({
        component: import(/* webpackChunkName: "code-editor" */ '@/components/shared/CodeEditor')
      })
    },
    setup () {
      const { vertical } = vuexAccessors('queryRest', ['vertical'])

      const {
        request,
        response,
        loading,
        loadData,
        resetResponse,
        responseStatusClass
      } = useRestQuery()

      const setRequest = item => {
        request.value = { method: item.method, path: item.path, body: item.body }
        resetResponse()
      }

      const canSendBody = computed(() => {
        return request.value.method !== 'GET' && request.value.method !== 'HEAD'
      })

      const reset = () => {
        store.commit('queryRest/resetRequest')
        resetResponse()
      }

      const historyCollapsed = ref(false)
      const editorCommands = [{
        bindKey: { win: 'Ctrl+ENTER', mac: 'Command+ENTER', linux: 'Ctrl+ENTER' },
        exec: loadData
      }]

      const downloadFileName = computed(() => {
        return `${request.value.method.toLowerCase()}_${request.value.path.replace(/[\W_]+/g, '_')}.json`
      })

      const generateDownloadData = () => {
        return typeof response.value.body === 'string' ? response.value.body : JSON.stringify(response.value.body)
      }

      return {
        loading,
        request,
        response,
        vertical,
        HTTP_METHODS,
        editorCommands,
        loadData,
        canSendBody,
        reset,
        setRequest,
        responseStatusClass,
        historyCollapsed,
        downloadFileName,
        generateDownloadData
      }
    }
  }
</script>
