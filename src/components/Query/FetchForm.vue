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
            <code-editor :code="stringifiedParams" v-bind:code.sync="stringifiedParams"></code-editor>
          </resizable-container>
          <i class="grey--text">Language: JSON</i>
        </v-flex>

        <v-flex md6>
          <label>Request headers</label>
          <resizable-container :initial-height="150">
            <code-editor :code="stringifiedHeaders" v-bind:code.sync="stringifiedHeaders"></code-editor>
          </resizable-container>
          <i class="grey--text">Language: JSON</i>
        </v-flex>
      </v-layout>

      <v-btn type="submit" :disabled="!isValid" :loading="loading" color="primary">Execute query</v-btn>
    </v-form>

    <h2 class="subheading mt-4">Response</h2>
    <v-divider class="my-2"></v-divider>
    <print-pretty-or-raw :document="response"></print-pretty-or-raw>
  </div>
</template>

<script>
  import ResizableContainer from '@/components/shared/ResizableContainer'
  import PrintPrettyOrRaw from '@/components/shared/PrintPrettyOrRaw'
  import CustomVAutocomplete from '@/components/shared/CustomVAutocomplete'
  import QueryFormBase from '@/components/Query/QueryFormBase'
  import Loading from '@/components/shared/Loading'

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
      }
    },
    methods: {
      fetchData () {
        if (this.method === 'GET' || this.method === 'HEAD') {
          fetch(this.host, {method: this.method, headers: JSON.parse(this.stringifiedHeaders)})
            .then(response => response.json())
            .then(json => (this.response = json))
        } else {
          fetch(this.host, {body: this.stringifiedParams, method: this.method, headers: JSON.parse(this.stringifiedHeaders)})
            .then(response => response.json())
            .then(json => (this.response = json))
        }
      },
      httpMethods () {
        return ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']
      }
    },
    components: {
      PrintPrettyOrRaw,
      ResizableContainer,
      CustomVAutocomplete,
      'code-editor': () => ({
        component: import('@/components/shared/CodeEditor'),
        loading: Loading
      })
    }
  }
</script>
