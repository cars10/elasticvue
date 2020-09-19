<template>
  <div>
    <div class="px-4">
      <v-form @submit.prevent="testConnection">
        <v-text-field id="host"
                      :rules="[hostValid]"
                      v-model="elasticsearchHost"
                      append-icon="mdi-close"
                      autofocus
                      label="Host"
                      title="Host"
                      type="text"
                      @click:append="resetElasticsearchHost"
                      @keyup.ctrl.enter="connect"
                      @keyup.esc="resetElasticsearchHost"/>
        <div class="mb-4">
          <v-btn id="test_connection"
                 :color="testConnectionColor"
                 :disabled="hostValid !== true"
                 :loading="testLoading"
                 class="mr-2 mt-2"
                 type="submit">
            Test connection
          </v-btn>

          <v-btn id="connect"
                 :color="connectColor"
                 :disabled="hostValid !== true"
                 :loading="connectLoading"
                 class="mt-2"
                 type="button"
                 @click.native="connect">Connect
          </v-btn>
        </div>
      </v-form>
      <p class="grey--text">To connect with credentials use http://username:password@host syntax. Don't encode special
        characters in the password!</p>
    </div>

    <div v-if="hasError" class="px-4">
      <v-alert :value="true" type="error">
        Could not connect. Please make sure that
        <ol class="pl-4">
          <li>Your cluster is reachable via <a :href="elasticsearchHost" target="_blank">{{ elasticsearchHost }}</a>
          </li>
          <li>You added the correct settings to your <strong>elasticsearch.yml</strong> and restarted your cluster</li>
        </ol>

        <div class="mt-2">
          {{ errorMessage }}
        </div>
      </v-alert>
    </div>
  </div>
</template>

<script>
  import store from '@/store'
  import { computed, ref } from '@vue/composition-api'
  import ConnectionService from '@/services/elasticsearch/ConnectionService'
  import { showErrorSnackbar, showSuccessSnackbar } from '@/mixins/ShowSnackbar'
  import { testAdapter } from '@/mixins/GetAdapter'
  import { compositionVuexAccessors } from '@/helpers/store'

  export default {
    name: 'test-and-connect',
    setup (props, context) {
      const testError = ref(false)
      const testSuccess = ref(false)
      const testLoading = ref(false)
      const connectLoading = ref(false)
      const connectError = ref(false)
      const errorMessage = ref('')

      const hasError = computed(() => {
        return testError.value || connectError.value
      })

      const testConnectionColor = computed(() => {
        return testError.value ? 'error' : 'primary'
      })

      const connectColor = computed(() => {
        return testSuccess.value ? 'success' : 'primary'
      })

      const { elasticsearchHost } = compositionVuexAccessors('connection', ['elasticsearchHost'])

      const hostValid = computed(() => {
        return elasticsearchHost.value.match(/^https?:\/\//) ? true : 'Host most contain a valid scheme'
      })

      const resetElasticsearchHost = () => {
        connectError.value = false
        testError.value = false
        testSuccess.value = false
        testLoading.value = false
        elasticsearchHost.value = 'http://localhost:9200'
      }

      const testConnection = () => {
        testLoading.value = true
        testSuccess.value = false
        testError.value = false
        new ConnectionService(elasticsearchHost.value).testAdapter()
          .then(() => {
            testLoading.value = false
            testSuccess.value = true
            testError.value = false
            showSuccessSnackbar({
              text: 'Success',
              additionalText: 'You cluster is reachable and configured correctly.'
            })
          })
          .catch(e => {
            testLoading.value = false
            testSuccess.value = false
            testError.value = true
            if (e instanceof TypeError) {
              errorMessage.value = 'Either your cluster is not reachable or you did not configure CORS correctly.'
            } else {
              errorMessage.value = e.message
            }
          })
      }

      const connect = () => {
        connectLoading.value = true
        connectError.value = false
        testAdapter()
          .then(() => {
            store.commit('connection/setConnected')
            connectLoading.value = false
            connectError.value = false
            showSuccessSnackbar({ text: 'Successfully connected.' })
            context.root.$router.push('/')
          })
          .catch(() => {
            connectLoading.value = false
            connectError.value = true
            showErrorSnackbar({ text: 'Error: could not connect.' })
          })
      }

      return {
        hasError,
        testConnectionColor,
        connectColor,
        hostValid,
        elasticsearchHost,
        resetElasticsearchHost,
        testConnection,
        connect,
        testLoading,
        connectLoading,
        errorMessage
      }
    }
  }
</script>
