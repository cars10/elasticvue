<template>
  <div>
    <div class="px-4">
      <v-form v-model="formValid" @submit.prevent="testConnection">
        <v-row>
          <v-col md="6" cols="12">
            <v-text-field v-model="elasticsearchHost.username"
                          autofocus
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
    </div>

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
  import { ref } from '@vue/composition-api'
  import { showSuccessSnackbar } from '@/mixins/ShowSnackbar'

  export default {
    name: 'test-and-connect',
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
        passwordVisible
      }
    }
  }
</script>
