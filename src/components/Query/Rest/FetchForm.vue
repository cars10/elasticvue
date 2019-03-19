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
                        placeholder="/_cat/indices"
                        autofocus/>
        </v-flex>
      </v-layout>

      <resizable-container :initial-height="150" class="mb-1">
        <code-editor v-model="stringifiedParams" :external-commands="editorCommands"/>
      </resizable-container>

      <v-btn id="execute_query" :disabled="!isValid" :loading="loading" type="submit" color="primary" class="mx-0">
        Run query
      </v-btn>
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
        path: '',
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
      ...mapVuexAccessors('queryRest', ['method', 'stringifiedParams'])
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
        this.response = {}
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
      }
    }
  }
</script>
