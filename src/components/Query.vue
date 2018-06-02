<template>
  <v-card>
    <v-card-title>
      <h1 class="headline">Query</h1>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <v-flex d-inline-flex mb-2>
        <v-alert :value="true" type="info">
          This is not a curl-like interface.
          You only have access to the elasticsearch javascript client. Example for "search" method: <br/>
          <ul class="pl-3">
            <li>host: localhost:9200</li>
            <li>method: search</li>
            <li>params: {"index": "myIndex", "q": "something"}</li>
          </ul>
        </v-alert>
      </v-flex>

      <v-form v-on:submit.prevent="loadData">
        <v-layout row wrap>
          <v-flex md6>
            <v-flex>
              <v-text-field v-model="hostUrl" label="Host" name="host" id="host"></v-text-field>
            </v-flex>
          </v-flex>
          <v-flex md6>
            <v-flex d-inline-flex>
              <custom-v-autocomplete label="Method"
                                     name="Method"
                                     v-model="method"
                                     :items="methods"
                                     item-text="name"
                                     item-value="name">
                <template slot="item" slot-scope="data">
                  {{data.item.name}}
                </template>
              </custom-v-autocomplete>
            </v-flex>
          </v-flex>

          <v-flex md12>
            <v-textarea label="Params" name="Params" id="params" class="font-mono"
                        v-model="stringifiedParams"
                        :rules="[parseParams]">
            </v-textarea>
          </v-flex>

          <v-btn type="submit" :disabled="!isValid" :loading="loading">Execute</v-btn>
          <v-btn flat :href="apiDocumentationUrl" target="_blank" :disabled="!apiDocumentationUrl">
            <v-icon>launch</v-icon>&nbsp;
            {{method}} Documentation
          </v-btn>
        </v-layout>
      </v-form>

      <v-divider class="mt-3"></v-divider>

      <print-pretty-or-raw :document="response"></print-pretty-or-raw>
    </v-card-text>
  </v-card>
</template>

<script>
  import PrintPrettyOrRaw from '@/components/shared/PrintPrettyOrRaw'
  import { REQUEST_DEFAULTS } from '../consts'
  import CustomVAutocomplete from '@/components/shared/CustomVAutocomplete'

  export default {
    name: 'Query',
    data () {
      return {
        loading: false,
        hostUrl: this.$store.state.connection.elasticsearchHost,
        method: null,
        methods: [],
        stringifiedParams: JSON.stringify(REQUEST_DEFAULTS),
        hasError: false,
        response: {},
        TYPES: ['cat', 'close', 'cluster', 'indices', 'ingest', 'nodes', 'snapshot', 'tasks', 'transport']
      }
    },
    computed: {
      apiDocumentationUrl () {
        return this.method ? `https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-${this.method.replace('.', '-')}` : null
      },
      parseParams () {
        try {
          JSON.parse(this.stringifiedParams)
          this.hasError = false
          return true
        } catch (error) {
          this.hasError = true
          return error.message
        }
      },
      isValid () {
        return !!this.method && !this.hasError && this.hostUrl.length > 0
      }
    },
    methods: {
      loadData () {
        this.loading = true
        this.getElasticsearchAdapter()
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
            this.showErrorSnackbar({text: 'Error:', additionalText: error.message})
          })
      },
      getMethods () {
        this.getElasticsearchAdapter().then(adapter => {
          let client = adapter.client

          this.methods.push({header: 'general'})
          for (let name of Object.getOwnPropertyNames(Object.getPrototypeOf(client))) {
            let method = client[name]
            if (typeof method !== 'function') continue
            this.methods.push({name})
          }

          for (let type of this.TYPES) {
            let clientTypeObject = client[type]
            this.methods.push({header: type})
            for (let name of Object.getOwnPropertyNames(Object.getPrototypeOf(clientTypeObject))) {
              let method = clientTypeObject[name]
              if (typeof method !== 'function') continue
              this.methods.push({name: `${type}.${name}`})
            }
          }
        })
      },
      parsedParams () {
        try {
          return JSON.parse(this.stringifiedParams)
        } catch (error) {
          return REQUEST_DEFAULTS
        }
      }
    },
    created () {
      this.getMethods()
    },
    components: {
      PrintPrettyOrRaw,
      CustomVAutocomplete
    }
  }
</script>
