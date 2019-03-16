<template>
  <div>
    <v-layout>
      <v-flex md6 pb-0>
        <v-form v-on:submit.prevent="loadData">
          <v-flex d-inline-flex pa-0>
            <custom-v-autocomplete v-model="method"
                                   :items="methods"
                                   label="Method"
                                   name="Method"
                                   item-text="name"
                                   item-value="name">
              <template v-slot:item="data">
                {{data.item.name}}
              </template>
            </custom-v-autocomplete>
          </v-flex>
          <v-btn :href="apiDocumentationUrl" target="_blank" flat
                 class="text-transform--none">
            <v-icon small>launch</v-icon>&nbsp;
            open {{method}} documentation
          </v-btn>

          <div class="mb-1">
            <label>Method options</label>
            <resizable-container :initial-height="150">
              <code-editor v-model="stringifiedParams" :external-commands="editorCommands"/>
            </resizable-container>
            <i class="grey--text">Language: JSON</i>
          </div>

          <v-btn :disabled="!isValid" :loading="loading" type="submit" color="primary" class="mx-0">Run query</v-btn>
        </v-form>
      </v-flex>
    </v-layout>

    <print-pretty :document="response" caption="Response"/>
  </div>
</template>

<script>
  import PrintPretty from '@/components/shared/PrintPretty'
  import CustomVAutocomplete from '@/components/shared/CustomVAutocomplete'
  import Loading from '@/components/shared/Loading'
  import ResizableContainer from '@/components/shared/ResizableContainer'
  import { API_BASE_URI } from '@/consts'
  import { mapVuexAccessors } from '@/helpers/store'
  import { showErrorSnackbar } from '@/mixins/ShowSnackbar'
  import esAdapter from '@/mixins/GetAdapter'

  export default {
    name: 'js-api-form',
    components: {
      PrintPretty,
      ResizableContainer,
      CustomVAutocomplete,
      'code-editor': () => ({
        component: import('@/components/shared/CodeEditor'),
        loading: Loading
      })
    },
    data () {
      return {
        loading: false,
        methods: [],
        hasError: false,
        response: {}
      }
    },
    computed: {
      apiDocumentationUrl () {
        if (this.method) {
          return API_BASE_URI + `#api-${this.method.replace('.', '-').toLowerCase()}`
        } else {
          return API_BASE_URI
        }
      },
      isValid () {
        return !!this.method && !this.hasError && this.host.length > 0
      },
      ...mapVuexAccessors('queryApiBrowser', ['method', 'stringifiedParams'])
    },
    created () {
      this.TYPES = ['cat', 'close', 'cluster', 'indices', 'ingest', 'nodes', 'snapshot', 'tasks', 'transport']
      this.getMethods()
      this.host = this.$store.state.connection.elasticsearchHost
      this.editorCommands = [{
        bindKey: { win: 'Ctrl+ENTER', mac: 'Command+ENTER', linux: 'Ctrl+ENTER' },
        exec: this.loadData
      }]
    },
    methods: {
      loadData () {
        this.loading = true
        esAdapter()
          .then(adapter => {
            const methodSplit = this.method.split('.')
            if (methodSplit.length === 1) {
              return adapter.client[methodSplit](this.parsedParams())
            } else {
              return adapter.client[methodSplit[0]][methodSplit[1]](this.parsedParams())
            }
          })
          .then(response => {
            this.loading = false
            this.response = response
          })
          .catch(error => {
            this.response = error.message
            this.loading = false
            showErrorSnackbar({ text: 'Error:', additionalText: error.message })
          })
      },
      getMethods () {
        esAdapter().then(adapter => {
          let client = adapter.client

          this.methods.push({ header: 'general' })
          for (let name of Object.getOwnPropertyNames(Object.getPrototypeOf(client))) {
            let method = client[name]
            if (typeof method !== 'function') continue
            this.methods.push({ name })
          }

          for (let type of this.TYPES) {
            let clientTypeObject = client[type]
            this.methods.push({ header: type })
            for (let name of Object.getOwnPropertyNames(Object.getPrototypeOf(clientTypeObject))) {
              let method = clientTypeObject[name]
              if (typeof method !== 'function') continue
              this.methods.push({ name: `${type}.${name}` })
            }
          }
        })
      },
      parsedParams () {
        return JSON.parse(this.stringifiedParams)
      }
    }
  }
</script>
