<template>
  <div>
    <v-form @submit.prevent="fetchData">
      <v-flex md2>
        <v-select label="HTTP Method"
                  name="http_method"
                  v-model="method"
                  :items="httpMethods()">
        </v-select>
      </v-flex>
      <v-text-field v-model="host"
                    label="Url"
                    name="Url"
                    autofocus
                    id="url"></v-text-field>

      <v-layout>
        <v-flex md6>
          <label>Request body</label>
          <resizable-container :initial-height="150">
            <code-editor :code="stringifiedParams"
                         v-bind:code.sync="stringifiedParams"
                         :external-handler="fetchData"></code-editor>
          </resizable-container>
          <i class="grey--text">Language: JSON</i>
        </v-flex>

        <v-flex md6>
          <label>Request headers</label>
          <resizable-container :initial-height="150">
            <code-editor :code="stringifiedHeaders"
                         v-bind:code.sync="stringifiedHeaders"
                         :external-handler="fetchData"></code-editor>
          </resizable-container>
          <i class="grey--text">Language: JSON</i>
        </v-flex>
      </v-layout>

      <v-btn type="submit" :disabled="!isValid" :loading="loading" color="primary" class="mx-0">Execute query</v-btn>
    </v-form>

    <h2 class="subheading mt-4">Response</h2>
    <v-divider class="my-2"></v-divider>
    <print-pretty :document="response"></print-pretty>
  </div>
</template>

<script>
  import ResizableContainer from '@/components/shared/ResizableContainer'
  import PrintPretty from '@/components/shared/PrintPretty'
  import CustomVAutocomplete from '@/components/shared/CustomVAutocomplete'
  import QueryFormBase from '@/components/Query/QueryFormBase'
  import Loading from '@/components/shared/Loading'
  import { HTTP_METHODS } from '../../consts'

  export default {
    name: 'fetch-form',
    extends: QueryFormBase,
    computed: {
      isValid () {
        return !!this.method && this.host.length > 0 && this.headersValid && this.paramsValid
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
          console.log(error)
          return false
        }
      },
      fetchOptionsHash () {
        let fetchOptions = {method: this.method, headers: JSON.parse(this.stringifiedHeaders)}
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
        fetch(this.host, this.fetchOptionsHash)
          .then(response => response.json())
          .then(json => {
            this.loading = false
            this.response = json
          })
          .catch(error => {
            this.showErrorSnackbar({text: 'Error.', additionalText: error})
            this.response = error
          })
      },
      httpMethods () {
        return HTTP_METHODS
      }
    },
    components: {
      PrintPretty,
      ResizableContainer,
      CustomVAutocomplete,
      'code-editor': () => ({
        component: import('@/components/shared/CodeEditor'),
        loading: Loading
      })
    }
  }
</script>
