<template>
  <div>
    <v-form v-model="formValid" @submit.prevent="testConnection">
      <div class="mb-4">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field v-model="elasticsearchHost.username"
                          :label="$t('setup.test_and_connect.form.username.label')"
                          autofocus
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

      <v-text-field id="host"
                    v-model="elasticsearchHost.uri"
                    :label="$t('setup.test_and_connect.form.uri.label')"
                    :rules="[validUri]"
                    append-icon="mdi-close"
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
          {{ $t('setup.test_and_connect.form.test_connection') }}
        </v-btn>

        <v-btn id="connect"
               :color="connectColor"
               :disabled="!formValid"
               :loading="testState.connectLoading"
               class="mt-2"
               type="button"
               @click.native="connectCluster">
          {{ $t('setup.test_and_connect.form.connect') }}
        </v-btn>
      </div>
    </v-form>

    <div v-if="hasError" class="px-4">
      <v-alert :value="true" type="error">
        {{ $t('setup.test_and_connect.error.heading') }}
        <ol class="pl-4">
          <li>
            {{ $t('setup.test_and_connect.error.cluster_reachable') }}
            <a :href="elasticsearchHost.uri" target="_blank">{{ elasticsearchHost.uri }}</a>
          </li>
          <li>
            {{ $t('setup.test_and_connect.error.correct_settings') }} <strong>elasticsearch.yml</strong>
            {{ $t('setup.test_and_connect.error.cluster_restarted') }}
          </li>
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
  import i18n from '@/i18n'
  import { computed, ref } from 'vue'
  import SslHint from '@/components/shared/SslHint'
  import AuthorizationHeaderHint from '@/components/shared/AuthorizationHeaderHint'
  import { SHOW_CORS_HINT } from '@/consts'
  import { showSuccessSnackbar } from '@/mixins/ShowSnackbar'
  import { reloadHomePage } from '@/helpers'
  import { useRouter } from '@/helpers/composition'

  export default {
    name: 'test-and-connect',
    components: {
      AuthorizationHeaderHint,
      SslHint
    },
    setup () {
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
      const { router } = useRouter()
      const connectCluster = () => {
        connect()
          .then(() => {
            if (testState.value.connectError) return
            store.commit('connection/setActiveInstanceIdx', 0)
            showSuccessSnackbar({ title: i18n.t('setup.test_and_connect.connected') })
            reloadHomePage(router, 0)
          })
      }

      const passwordVisible = ref(false)
      const usesSSL = computed(() => (elasticsearchHost.value.uri.match(/^https/)))

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
