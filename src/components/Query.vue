<template>
  <v-card>
    <v-card-title><h2>Query</h2></v-card-title>
    <v-divider></v-divider>
    <v-card-text>
      <v-form v-on:submit.prevent="loadData">
        <v-container grid-list-xs>
          <v-layout row wrap>
            <v-flex xs6 elevation>
              <v-flex>
                <v-text-field v-model="hostUrl" label="Host" name="Host"></v-text-field>
              </v-flex>
            </v-flex>
            <v-flex xs6>
              <v-flex d-inline-flex>
                <v-select autocomplete
                          auto
                          multi-line
                          max-height="500"
                          label="Method"
                          name="Method"
                          v-model="method"
                          :items="methods"
                          item-text="name"
                          item-value="name">
                  <template slot="item" slot-scope="data">
                    <v-list-tile-content v-text="data.item.name"></v-list-tile-content>
                  </template>
                </v-select>
              </v-flex>
              <v-flex d-inline-flex>
                <v-btn :href="apiDocumentationUrl" target="_blank" :disabled="!apiDocumentationUrl">
                  <v-icon>launch</v-icon>&nbsp;
                  Documentation
                </v-btn>
              </v-flex>
            </v-flex>

            <v-flex xs12>
              <v-text-field multi-line label="Params" name="Params" class="font-mono"
                            v-model="stringifiedParams"
                            :rules="[parseParams]">
              </v-text-field>
            </v-flex>

            <v-btn type="submit" :disabled="!isValid">Fetch</v-btn>
          </v-layout>
        </v-container>
      </v-form>

      <v-divider></v-divider>

      <print-pretty-or-raw :document="response"></print-pretty-or-raw>
    </v-card-text>
  </v-card>
</template>

<script>
  import PrintPrettyOrRaw from '@/components/shared/PrintPrettyOrRaw'
  import { REQUEST_DEFAULTS } from '../consts'

  export default {
    data () {
      return {
        hostUrl: this.$store.state.connection.elasticsearchHost,
        method: null,
        methods: [],
        stringifiedParams: JSON.stringify(REQUEST_DEFAULTS),
        hasError: false,
        response: {},
        TYPES: ['cat', 'close', 'cluster', 'indices', 'ingest', 'nodes', 'snapshot', 'tasks', 'transport']
      }
    },
    components: {
      PrintPrettyOrRaw
    },
    created () {
      this.getMethods()
    },
    methods: {
      loadData () {
        alert('loadData')
        this.getElasticsearchAdapter()
          .then(adapter => adapter.client[this.method.split('.')[0]][this.method.split('.')[1]]())
          .then(
            response => {
              this.response = response
            })
          .catch(error => {
            this.response = ''
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
          return {}
        }
      },
      getNestedMethod (client) {
        let methodNames = this.method.split('.')
        let nestedClient = client
        for (let methodName of methodNames) {
          nestedClient = nestedClient[methodName]
        }
        console.log(nestedClient)
        return nestedClient
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
    }
  }
</script>
