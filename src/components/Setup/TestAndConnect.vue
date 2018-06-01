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
                        :append-icon-cb="resetElasticsearchHost"></v-text-field>
        </v-flex>
        <v-btn type="submit"
               :color="testConnectionColor"
               :loading="testLoading"
               :disabled="hostValid !== true">
          Test connection
        </v-btn>

        <v-btn :disabled="!testSuccess" color="success" type="button" @click.native="connect">Connect</v-btn>
      </v-form>
    </v-flex>

    <v-flex px-3 v-if="testError">
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
    extends: ConnectBase
  }
</script>
