<template>
  <div>
    <v-flex d-inline-flex mb-4>
      <v-alert :value="true" type="info" class="mt-4">
        This is not a curl-like interface.
        You only have access to the elasticsearch javascript client. Example for "search" method: <br/>
        <ul class="pl-3">
          <li>host: localhost:9200</li>
          <li>method: search</li>
          <li>method options: {"index": "myIndex", "q": "something"}</li>
        </ul>
      </v-alert>
    </v-flex>

    <h2 class="subheading">Build query</h2>
    <v-divider class="my-2"></v-divider>
    <v-form v-on:submit.prevent="loadData">
      <v-layout row wrap>
        <v-flex md4>
          <v-flex>
            <v-text-field v-model="host"
                          label="Host"
                          name="host"
                          autofocus
                          id="host"></v-text-field>
          </v-flex>
        </v-flex>
        <v-flex md2>
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
      </v-layout>

      <div class="mx-1 mb-2">
        <label>Method options</label>

        <resizable-container :initial-height="250">
          <code-editor :code="stringifiedParams" v-bind:code.sync="stringifiedParams"></code-editor>
        </resizable-container>
        <i class="grey--text">Language: JSON</i>
      </div>

      <v-btn type="submit" :disabled="!isValid" :loading="loading">Execute</v-btn>
      <v-btn flat :href="apiDocumentationUrl" target="_blank" :disabled="!apiDocumentationUrl">
        <v-icon>launch</v-icon>&nbsp;
        {{method}} Documentation
      </v-btn>
    </v-form>

    <v-divider class="my-4"></v-divider>
    <h2 class="subheading">Response</h2>
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
    name: 'js-api-form',
    extends: QueryFormBase,
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
