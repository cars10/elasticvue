<template>
  <v-layout>
    <v-flex md6>
      <v-card>
        <v-card-text>
          <h2 class="subheading">Build query</h2>
          <v-divider class="my-2"/>
          <v-form v-on:submit.prevent="loadData">
            <v-layout row wrap>
              <v-flex md8>
                <v-flex>
                  <v-text-field id="host" v-model="host" label="Host" name="host"/>
                </v-flex>
              </v-flex>
              <v-flex md4>
                <v-flex d-inline-flex>
                  <custom-v-autocomplete v-model="method"
                                         :items="methods"
                                         label="Method"
                                         name="Method"
                                         item-text="name"
                                         item-value="name">
                    <template slot="item" slot-scope="data">
                      {{data.item.name}}
                    </template>
                  </custom-v-autocomplete>
                </v-flex>
              </v-flex>
            </v-layout>

            <div class="mx-1 mb-2">
              <label>Method options</label>
              <div style="height: 500px; width: 100%;">
                <code-editor :v-model="stringifiedParams"/>
              </div>
              <i class="grey--text">Language: JSON</i>
            </div>

            <v-btn :disabled="!isValid" :loading="loading" type="submit">Execute</v-btn>
            <v-btn :href="apiDocumentationUrl" :disabled="!apiDocumentationUrl" flat target="_blank">
              <v-icon>launch</v-icon>&nbsp;
              {{method}} Documentation
            </v-btn>
          </v-form>

          <v-alert :value="true" type="info" class="mt-4">
            This is not a curl-like interface.
            You only have access to the elasticsearch javascript client. Example for "search" method: <br>
            <ul class="pl-3">
              <li>host: localhost:9200</li>
              <li>method: search</li>
              <li>method options: {"index": "myIndex", "q": "something"}</li>
            </ul>
          </v-alert>
        </v-card-text>
      </v-card>
    </v-flex>

    <v-flex md6>
      <v-card>
        <v-card-text>
          <h2 class="subheading">Response</h2>
          <v-divider class="my-2"/>
          <print-pretty-or-raw :document="response"/>
        </v-card-text>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
  import PrintPrettyOrRaw from '@/components/shared/PrintPretty'
  import CustomVAutocomplete from '@/components/shared/CustomVAutocomplete'
  import Loading from '@/components/shared/Loading'
  import { REQUEST_DEFAULTS } from '../../../consts'

  export default {
    name: 'js-api-form',
    components: {
      PrintPrettyOrRaw,
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
        response: {},
        TYPES: ['cat', 'close', 'cluster', 'indices', 'ingest', 'nodes', 'snapshot', 'tasks', 'transport']
      }
    },
    computed: {
      apiDocumentationUrl () {
        return this.method ? `https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-${this.method.replace('.', '-')}` : null
      },
      isValid () {
        return !!this.method && !this.hasError && this.host.length > 0
      },
      host: {
        get () {
          return this.$store.state.query.host
        },
        set (host) {
          this.$store.commit('setQueryHost', host)
        }
      },
      method: {
        get () {
          return this.$store.state.query.method
        },
        set (method) {
          this.$store.commit('setQueryMethod', method)
        }
      },
      stringifiedParams: {
        get () {
          return this.$store.state.query.stringifiedParams
        },
        set (params) {
          this.$store.commit('setQueryStringifiedParams', params)
        }
      }
    },
    created () {
      this.getMethods()
      this.host = this.$store.state.connection.elasticsearchHost
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
            this.showErrorSnackbar({ text: 'Error:', additionalText: error.message })
          })
      },
      getMethods () {
        this.getElasticsearchAdapter().then(adapter => {
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
        try {
          return JSON.parse(this.stringifiedParams)
        } catch (error) {
          return REQUEST_DEFAULTS
        }
      }
    }
  }

</script>
