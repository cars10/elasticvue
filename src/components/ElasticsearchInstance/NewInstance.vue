<template>
  <v-dialog v-model="dialog" class="theme--dark" width="800">
    <template v-slot:activator="{ on, attrs }">
      <v-btn id="add_new_instance" v-bind="attrs" v-on="on" color="primary-button">
        {{ $t('elasticsearch_instance.new_instance.add_cluster') }}
      </v-btn>
    </template>
    <v-card>
      <v-card-title class="text-h5">
        <h2 class="text-h5">{{ $t('elasticsearch_instance.new_instance.heading') }}</h2>
        <div class="ml-a">
          <v-btn icon :title="$t('defaults.close')" @click.native="closeDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <v-divider/>

      <v-card-text v-if="SHOW_CORS_HINT">
        <h2 class="text-h6 my-4">{{ $t('elasticsearch_instance.new_instance.configure.heading') }}</h2>
        <v-expand-transition>
          <configure v-if="configureHintVisible"/>
        </v-expand-transition>
        <v-btn class="pl-1" small text @click="configureHintVisible = !configureHintVisible">
          <v-icon>{{ configureHintVisible ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
          {{ $t('elasticsearch_instance.new_instance.configure.show_help') }}
        </v-btn>
      </v-card-text>

      <v-divider/>

      <v-card-text>
        <h2 v-if="SHOW_CORS_HINT" class="text-h6 my-4">
          {{ $t('elasticsearch_instance.new_instance.connect.heading') }}
        </h2>

        <v-form ref="form" v-model="formValid" lazy-validation @submit.prevent="testConnection">
          <v-text-field v-if="dialog"
                        id="new_instance_name"
                        v-model="elasticsearchHost.name"
                        :label="$t('elasticsearch_instance.new_instance.connect.form.name.label')"
                        :rules="[validName]"
                        append-icon="mdi-close"
                        autocomplete="off"
                        autofocus
                        class="mb-2"
                        name="name"
                        required
                        @keyup.ctrl.enter="connectCluster"
                        @click:append="elasticsearchHost.name = ''"/>

          <div class="mb-4">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field v-model="elasticsearchHost.username"
                              :label="$t('setup.test_and_connect.form.username.label')"
                              type="text"/>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field v-model="elasticsearchHost.password"
                              :append-icon="passwordVisible ? 'mdi-eye' : 'mdi-eye-off'"
                              :label="$t('setup.test_and_connect.form.password.label')"
                              :type="passwordVisible ? 'text' : 'password'"
                              autocomplete="off"
                              @click:append="passwordVisible = !passwordVisible"/>
              </v-col>
            </v-row>
            <authorization-header-hint v-if="SHOW_CORS_HINT && elasticsearchHost.username"/>
          </div>

          <div class="mb-4">
            <v-text-field v-if="dialog"
                          id="new_instance_uri"
                          v-model="elasticsearchHost.uri"
                          :label="$t('setup.test_and_connect.form.uri.label')"
                          :rules="[validUri]"
                          append-icon="mdi-close"
                          name="uri"
                          required
                          @keyup.ctrl.enter="connectCluster"
                          @click:append="elasticsearchHost.uri = ''"/>
            <ssl-hint v-if="usesSSL"/>
          </div>

          <v-alert :value="hasError" type="error">
            {{ $t('setup.test_and_connect.error.heading') }}
            <ol class="pl-4">
              <li>
                {{ $t('setup.test_and_connect.error.cluster_reachable') }}
                <a :href="elasticsearchHost.uri" target="_blank" class="white--text">{{ elasticsearchHost.uri }}</a>
              </li>
              <li>
                {{ $t('setup.test_and_connect.error.correct_settings') }}
                <strong>elasticsearch.yml</strong>
                {{ $t('setup.test_and_connect.error.cluster_restarted') }}
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
              {{ $t('elasticsearch_instance.new_instance.connect.form.test_connection') }}
            </v-btn>

            <v-btn id="connect"
                   :color="connectColor"
                   :disabled="!formValid"
                   :loading="testState.connectLoading"
                   class="mr-2"
                   type="button"
                   @click.native="connectCluster">
              {{ $t('elasticsearch_instance.new_instance.connect.form.connect') }}
            </v-btn>
            <v-btn text @click="closeDialog">{{ $t('defaults.cancel') }}</v-btn>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
  import store from '@/store'
  import { vuexAccessors } from '@/helpers/store'
  import { computed, ref } from 'vue'
  import { useTestConnection } from '@/mixins/TestConnection'
  import { SHOW_CORS_HINT } from '@/consts'
  import Configure from '@/components/Setup/Configure'
  import SslHint from '@/components/shared/SslHint'
  import AuthorizationHeaderHint from '@/components/shared/AuthorizationHeaderHint'
  import { reloadHomePage } from '@/helpers'
  import { useRouter } from '@/helpers/composition'

  export default {
    name: 'new-instance',
    components: {
      AuthorizationHeaderHint,
      Configure,
      SslHint
    },
    setup () {
      const dialog = ref(false)
      const closeDialog = () => {
        dialog.value = false
        resetElasticsearchHost()
      }

      const { instances } = vuexAccessors('connection', ['instances'])

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

      const { router } = useRouter()
      const connectCluster = () => {
        connect()
          .then(() => {
            if (!testState.value.connectError) {
              const newId = instances.value.length - 1
              store.commit('connection/setActiveInstanceIdx', newId)
              reloadHomePage(router, newId)
            }
          })
      }

      const passwordVisible = ref(false)
      const configureHintVisible = ref(false)
      const usesSSL = computed(() => (elasticsearchHost.value.uri.match(/^https/)))

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
        SHOW_CORS_HINT
      }
    }
  }
</script>
