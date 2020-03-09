<template>
  <div>
    <h2 class="title mb-1">2. Test and connect</h2>
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
                      @keyup.ctrl.enter="connect"/>
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
          <li>Your cluster is reachable via <a :href="elasticsearchHost" target="_blank">{{elasticsearchHost}}</a></li>
          <li>You added the correct settings to your <strong>elasticsearch.yml</strong> and restarted your cluster</li>
        </ol>

        <div class="mt-2">
          {{errorMessage}}
        </div>
      </v-alert>
    </div>
  </div>
</template>

<script>
  import ConnectBase from '@/components/Setup/ConnectBase'

  export default {
    name: 'test-and-connect',
    extends: ConnectBase,
    computed: {
      hasError () {
        return this.testError || this.connectError
      },
      testConnectionColor () {
        return this.testError ? 'error' : 'primary'
      },
      connectColor () {
        return this.testSuccess ? 'success' : 'primary'
      }
    }
  }
</script>
