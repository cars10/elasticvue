<template>
  <div>
    <v-form @submit.prevent="fetchData">
      <v-layout>
        <v-flex xl1 lg2 sm3>
          <v-select v-model="method"
                    :items="httpMethods"
                    label="HTTP Method"
                    name="http_method"/>
        </v-flex>
        <v-flex xl11 lg10 sm9>
          <v-text-field id="url"
                        v-model="elasticsearchHost"
                        label="Url"
                        name="Url"
                        autofocus/>
        </v-flex>
      </v-layout>

      <v-layout>
        <v-flex md6>
          <label>Request body</label>
          <resizable-container :initial-height="150">
            <code-editor v-model="stringifiedParams" :external-commands="editorCommands"/>
          </resizable-container>
          <i class="grey--text">Language: JSON</i>
        </v-flex>

        <v-flex md6>
          <label>Request headers</label>
          <resizable-container :initial-height="150">
            <code-editor v-model="stringifiedHeaders" :external-commands="editorCommands"/>
          </resizable-container>
          <i class="grey--text">Language: JSON</i>
        </v-flex>
      </v-layout>

      <v-btn id="execute_query" :disabled="!isValid" :loading="loading" type="submit" color="primary" class="mx-0">
        Execute query
      </v-btn>
    </v-form>

    <h2 class="subheading mt-4">Response</h2>
    <v-divider class="my-2"/>
    <print-pretty :document="response" :initial-height="800"/>
  </div>
</template>

<script>
  import ResizableContainer from '@/components/shared/ResizableContainer'
  import PrintPretty from '@/components/shared/PrintPretty'
  import CustomVAutocomplete from '@/components/shared/CustomVAutocomplete'
  import QueryFormBase from '@/components/Query/QueryFormBase'
  import Loading from '@/components/shared/Loading'
  import { HTTP_METHODS } from '../../consts'
  import qs from 'querystringify'
  import { buildFetchAuthHeaderFromUrl, urlWithoutCredentials } from '../../helpers'

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
    extends: QueryFormBase,
    data () {
      return {
        httpMethods: HTTP_METHODS,
        editorCommands: [{
          bindKey: { win: 'Ctrl+ENTER', mac: 'Command+ENTER', linux: 'Ctrl+ENTER' },
          exec: this.fetchData
        }]
      }
    },
    computed: {
      isValid () {
        return !!this.method && this.elasticsearchHost.length > 0 && this.headersValid && this.paramsValid
      },
      headersValid () {
        try {
          JSON.parse(this.stringifiedHeaders)
          return true
        } catch (error) {
          return false
        }
      },
      paramsValid () {
        try {
          JSON.parse(this.stringifiedParams)
          return true
        } catch (error) {
          return false
        }
      },
      fetchUrl () {
        let host = urlWithoutCredentials(this.elasticsearchHost)
        if (this.method === 'GET' || this.method === 'HEAD') {
          return host + '?' + qs.stringify(JSON.parse(this.stringifiedParams), '')
        } else {
          return host
        }
      },
      fetchOptionsHash () {
        let fetchOptions = {
          method: this.method,
          headers: Object.assign(buildFetchAuthHeaderFromUrl(this.elasticsearchHost), JSON.parse(this.stringifiedHeaders))
        }
        if (this.method !== 'GET' && this.method !== 'HEAD') {
          fetchOptions.body = this.stringifiedParams
        }
        return fetchOptions
      }
    },
    methods: {
      fetchData () {
        this.loading = true
        this.response = {}
        fetch(this.fetchUrl, this.fetchOptionsHash)
          .then(response => response.json())
          .then(json => {
            this.loading = false
            this.response = json
          })
          .catch(error => {
            this.loading = false
            this.showErrorSnackbar({ text: 'Error.', additionalText: error.message })
            this.response = error.message
          })
      }
    }
  }
</script>
