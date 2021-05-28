<template>
  <v-dialog v-model="dialog" class="theme--dark" width="800">
    <template v-slot:activator="{ on, attrs }">
      <v-list-item id="add_new_instance" v-bind="attrs" v-on="on" aria-label="Add elasticsearch instance" ripple>
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

      <v-card-text v-if="enableCorsHint">
        <h2 class="text-h6 my-4">1. Configure</h2>
        <v-expand-transition>
          <configure v-if="configureHintVisible"/>
        </v-expand-transition>
        <v-btn class="pl-1" small text @click="configureHintVisible = !configureHintVisible">
          <v-icon>{{ configureHintVisible ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
          Show help
        </v-btn>
      </v-card-text>

      <v-divider/>

      <v-card-text>
        <h2 v-if="enableCorsHint" class="text-h6 my-4">2. Connect</h2>
        <v-form ref="form" v-model="formValid" lazy-validation @submit.prevent="testConnection">

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
            <v-col cols="12" md="6">
              <v-text-field v-model="elasticsearchHost.username"
                            label="Username"
                            title="Username"
                            type="text"/>
            </v-col>
            <v-col cols="12" md="6">
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

          <ssl-hint v-if="usesSSL"/>

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

          <div class="mt-4">
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
                   class="mr-2"
                   type="button"
                   @click.native="connectCluster">Connect
            </v-btn>
            <v-btn text @click="closeDialog">Cancel</v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
  import store from '@/store'
  import { compositionVuexAccessors } from '@/helpers/store'
  import { computed, ref } from '@vue/composition-api'
  import { useTestConnection } from '@/mixins/TestConnection'
  import { BASE_URI } from '@/consts'
  import Configure from '@/components/Setup/Configure'
  import SslHint from '@/components/shared/SslHint'

  export default {
    name: 'elasticsearch-instance',
    components: {
      Configure,
      SslHint
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
      const usesSSL = computed(() => {
        return elasticsearchHost.value.uri.match(/^https/)
      })

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
        usesSSL,
        enableCorsHint: process.env.VUE_APP_DISABLE_CORS_HINT !== 'true'
      }
    }
  }
</script>
