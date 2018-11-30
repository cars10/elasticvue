<template>
  <div>
    <v-form @submit.prevent="fetchData">
      <v-layout>
        <v-flex xl1 lg2 sm3 pb-0>
          <v-select v-model="method"
                    :items="httpMethods"
                    label="HTTP Method"
                    name="http_method"/>
        </v-flex>
        <v-flex xl11 lg10 sm9 pb-0>
          <v-text-field id="url"
                        v-model="elasticsearchHost"
                        label="Url"
                        name="Url"
                        autofocus/>
        </v-flex>
      </v-layout>

      <v-layout mb-1>
        <v-flex md6 py-0>
          <label>Request body</label>
          <resizable-container :initial-height="150">
            <code-editor v-model="stringifiedParams" :external-commands="editorCommands"/>
          </resizable-container>
          <i class="grey--text">Language: JSON</i>
        </v-flex>

        <v-flex md6 py-0>
          <label>Request headers</label>
          <resizable-container :initial-height="150">
            <code-editor v-model="stringifiedHeaders" :external-commands="editorCommands"/>
          </resizable-container>
          <i class="grey--text">Language: JSON</i>
        </v-flex>
      </v-layout>

      <v-btn id="execute_query" :disabled="!isValid" :loading="loading" type="submit" color="primary" class="mx-0">
        Run query
      </v-btn>
    </v-form>

    <print-pretty :document="response" :initial-height="800" caption="Response"/>
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
        httpMethods: HTTP_METHODS,
        editorCommands: [{
          bindKey: { win: 'Ctrl+ENTER', mac: 'Command+ENTER', linux: 'Ctrl+ENTER' },
          exec: this.fetchData
        }],
        loading: false,
        hasError: false,
        response: {},
        elasticsearchHost: this.$store.state.connection.elasticsearchHost
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
      },
      ...mapVuexAccessors('queryRest', ['method', 'stringifiedParams', 'stringifiedHeaders'])
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
