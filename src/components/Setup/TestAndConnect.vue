<template>
  <div>
    <h2 class="title mb-1">2. Test and connect</h2>
    <v-flex px-3>
      <v-form v-on:submit.prevent="testConnection">
        <v-flex d-inline-flex>
          <v-text-field title="Host"
                        label="Host"
                        id="host"
                        type="text"
                        autofocus
                        v-model="elasticsearchHost"
                        :rules="[hostValid]"
                        append-icon="clear"
                        @keyup.ctrl.enter="connectIfTestSuccessfull"
                        @click:append="resetElasticsearchHost"></v-text-field>
        </v-flex>
        <v-btn type="submit"
               id="test_connection"
               :color="testConnectionColor"
               :loading="testLoading"
               :disabled="hostValid !== true">
          Test connection
        </v-btn>

        <v-btn :disabled="!testSuccess"
               id="connect"
               :color="connectColor"
               type="button"
               :loading="connectLoading"
               @click.native="connectIfTestSuccessfull">Connect
        </v-btn>
      </v-form>
      <span class="grey--text">Hint: use <i>enter</i> to test connection, <i>ctrl+enter</i> to connect</span>
    </v-flex>

    <v-flex px-3 v-if="testError || connectError">
      <v-alert :value="true" type="error">
        Could not connect. Please make sure that
        <ol class="pl-3">
          <li>Your cluster is reachable via {{elasticsearchHost}}</li>
          <li>You added the correct settings to your <strong>elasticserach.yml</strong> and restarted your cluster</li>
        </ol>
      </v-alert>
    </v-flex>
  </div>
</template>

<script>
  import ConnectBase from '@/components/Setup/ConnectBase'

  export default {
    name: 'test-and-connect',
    extends: ConnectBase,
    computed: {
      testConnectionColor () {
        return this.testError ? 'error' : 'primary'
      },
      connectColor () {
        return this.connectError ? 'error' : 'success'
      }
    }
  }
</script>
