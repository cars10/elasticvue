<template>
  <v-dialog v-model="dialog" width="800">
    <template v-slot:activator="{ on, attrs }">
      <v-list-item id="add_new_instance" v-bind="attrs" ripple v-on="on">
        <v-list-item-action>
          <v-icon>mdi-plus</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>Add elasticsearch instance</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </template>
    <v-card>
      <v-card-title class="text-h5">
        <h2 class="text-h5">Add elasticsearch instance</h2>
        <div class="ml-a">
          <v-btn icon title="Close" @click.native="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <v-divider/>

      <v-card-text v-if="enableCorsHint" class="pa-4">
        <h2 class="text-h6 mb-1">1. Configure</h2>
        <configure v-if="configureHintVisible"/>
        <div class="pt-2">
          <a class="grey--text user-select--none" @click="configureHintVisible = !configureHintVisible">
            <v-icon>{{ configureHintVisible ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            Show help
          </a>
        </div>
      </v-card-text>

      <v-divider/>

      <v-form ref="form" v-model="formValid" lazy-validation @submit.prevent="testConnection">
        <v-card-text>
          <h2 v-if="enableCorsHint" class="text-h6 mb-4">2. Connect</h2>

          <v-text-field v-if="dialog"
                        id="new_instance_name"
                        v-model="elasticsearchHost.name"
                        :rules="[validName]"
                        append-icon="mdi-close"
                        autocomplete="off"
                        autofocus
                        label="Cluster name"
                        name="name"
                        required
                        @keyup.ctrl.enter="connectCluster"
                        @click:append="elasticsearchHost.name = ''"/>

          <v-row>
            <v-col md="6" cols="12">
              <v-text-field v-model="elasticsearchHost.username"
                            label="Username"
                            title="Username"
                            type="text"/>
            </v-col>
            <v-col md="6" cols="12">
              <v-text-field v-model="elasticsearchHost.password"
                            :append-icon="passwordVisible ? 'mdi-eye' : 'mdi-eye-off'"
                            :type="passwordVisible ? 'text' : 'password'"
                            autocomplete="off"
                            label="Password"
                            title="Password"
                            @click:append="passwordVisible = !passwordVisible"/>
            </v-col>
          </v-row>

          <v-text-field v-if="dialog"
                        id="new_instance_uri"
                        v-model="elasticsearchHost.uri"
                        :rules="[validUri]"
                        append-icon="mdi-close"
                        label="Uri"
                        name="uri"
                        required
                        @keyup.ctrl.enter="connectCluster"
                        @click:append="elasticsearchHost.uri = ''"/>

          <v-alert :value="hasError" type="error">
            Could not connect. Please make sure that
            <ol class="pl-4">
              <li>Your cluster is reachable via <a :href="elasticsearchHost.uri"
                                                   target="_blank">{{ elasticsearchHost.uri }}</a>
              </li>
              <li>You added the correct settings to your <strong>elasticsearch.yml</strong> and restarted your cluster
              </li>
            </ol>

            <div class="mt-2">
              {{ testState.errorMessage }}
            </div>
          </v-alert>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-btn id="test_connection"
                 :color="testConnectionColor"
                 :disabled="!formValid"
                 :loading="testState.testLoading"
                 class="mr-2"
                 type="submit">
            Test connection
          </v-btn>

          <v-btn id="connect"
                 :color="connectColor"
                 :disabled="!formValid"
                 :loading="testState.connectLoading"
                 type="button"
                 @click.native="connectCluster">Connect
          </v-btn>
          <v-btn text @click="closeDialog">Cancel</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
  import store from '@/store'
  import { compositionVuexAccessors } from '@/helpers/store'
  import { ref } from '@vue/composition-api'
  import { useTestConnection } from '@/mixins/TestConnection'
  import { BASE_URI } from '@/consts'
  import Configure from '@/components/Setup/Configure'

  export default {
    name: 'elasticsearch-instance',
    components: {
      Configure
    },
    setup () {
      const dialog = ref(false)
      const closeDialog = () => {
        dialog.value = false
        resetElasticsearchHost()
      }

      const { instances } = compositionVuexAccessors('connection', ['instances'])

      const formValid = ref(false)

      const {
        testState,
        hasError,
        testConnectionColor,
        connectColor,
        elasticsearchHost,
        validName,
        validUri,
        resetElasticsearchHost,
        testConnection,
        connect
      } = useTestConnection()

      const connectCluster = () => {
        connect()
          .then(() => {
            if (!testState.value.connectError) {
              store.commit('connection/setActiveInstanceIdx', instances.value.length - 1)
              window.location.replace(BASE_URI)
            }
          })
      }

      const passwordVisible = ref(false)
      const configureHintVisible = ref(false)

      return {
        dialog,
        formValid,
        elasticsearchHost,
        validName,
        validUri,
        closeDialog,
        testState,
        hasError,
        testConnectionColor,
        connectColor,
        resetElasticsearchHost,
        testConnection,
        connectCluster,
        passwordVisible,
        configureHintVisible,
        enableCorsHint: process.env.VUE_APP_DISABLE_CORS_HINT !== 'true'
      }
    }
  }
</script>
