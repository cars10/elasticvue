<template>
  <div>
    <v-form v-model="formValid" @submit.prevent="testConnection">
      <div class="mb-4">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="elasticsearchHost.username"
                          autofocus
                          label="Username (optional)"
                          title="Username"
                          type="text"/>
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field v-model="elasticsearchHost.password"
                          :append-icon="passwordVisible ? 'mdi-eye' : 'mdi-eye-off'"
                          :type="passwordVisible ? 'text' : 'password'"
                          autocomplete="off"
                          label="Password (optional)"
                          title="Password"
                          @click:append="passwordVisible = !passwordVisible"/>
          </v-col>
        </v-row>
        <authorization-header-hint v-if="SHOW_CORS_HINT && elasticsearchHost.username"/>
      </div>

      <v-text-field id="host"
                    v-model="elasticsearchHost.uri"
                    :rules="[validUri]"
                    append-icon="mdi-close"
                    label="Host"
                    title="Host"
                    type="text"
                    @click:append="resetElasticsearchHost"
                    @keyup.ctrl.enter="connectCluster"
                    @keyup.esc="resetElasticsearchHost"/>

      <ssl-hint v-if="usesSSL"/>

      <div class="mb-4">
        <v-btn id="test_connection"
               :color="testConnectionColor"
               :disabled="!formValid"
               :loading="testState.testLoading"
               class="mr-2 mt-2"
               type="submit">
          Test connection
        </v-btn>

        <v-btn id="connect"
               :color="connectColor"
               :disabled="!formValid"
               :loading="testState.connectLoading"
               class="mt-2"
               type="button"
               @click.native="connectCluster">Connect
        </v-btn>
      </div>
    </v-form>

    <div v-if="hasError" class="px-4">
      <v-alert :value="true" type="error">
        Could not connect. Please make sure that
        <ol class="pl-4">
          <li>
            Your cluster is reachable via
            <a :href="elasticsearchHost.uri" target="_blank">{{ elasticsearchHost.uri }}</a>
          </li>
          <li>You added the correct settings to your <strong>elasticsearch.yml</strong> and restarted your cluster</li>
        </ol>

        <div class="mt-2">
          {{ testState.errorMessage }}
        </div>
      </v-alert>
    </div>
  </div>
</template>

<script>
  import { useTestConnection } from '@/mixins/TestConnection'
  import store from '@/store'
  import { computed, ref } from '@vue/composition-api'
  import { showSuccessSnackbar } from '@/mixins/ShowSnackbar'
  import SslHint from '@/components/shared/SslHint'
  import AuthorizationHeaderHint from '@/components/shared/AuthorizationHeaderHint'
  import { SHOW_CORS_HINT } from '@/consts'

  export default {
    name: 'test-and-connect',
    components: {
      AuthorizationHeaderHint,
      SslHint
    },
    setup (props, context) {
      const {
        testState,
        hasError,
        testConnectionColor,
        connectColor,
        elasticsearchHost,
        validUri,
        resetElasticsearchHost,
        testConnection,
        connect
      } = useTestConnection()

      const formValid = ref(false)

      const connectCluster = () => {
        connect()
          .then(() => {
            if (testState.value.connectError) return
            store.commit('connection/setActiveInstanceIdx', 0)
            showSuccessSnackbar({ text: 'Successfully connected.' })
            context.root.$router.push('/')
          })
      }

      const passwordVisible = ref(false)
      const usesSSL = computed(() => {
        return elasticsearchHost.value.uri.match(/^https/)
      })

      return {
        hasError,
        testConnectionColor,
        connectColor,
        validUri,
        elasticsearchHost,
        resetElasticsearchHost,
        testConnection,
        connectCluster,
        testState,
        formValid,
        passwordVisible,
        usesSSL,
        SHOW_CORS_HINT
      }
    }
  }
</script>
