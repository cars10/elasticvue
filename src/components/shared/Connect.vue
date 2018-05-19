<template>
  <v-form class="d-flex align-center" v-if="isToolbar" v-on:submit.prevent="connectAndEmitHostChanged">
    <v-toolbar-items>
      <v-text-field solo
                    title="Host"
                    label="Host"
                    id="toolbarHost"
                    type="text"
                    v-model="elasticsearchHost"
                    append-icon="clear"
                    :append-icon-cb="resetElasticsearchHost"></v-text-field>
    </v-toolbar-items>
    <v-btn type="submit">Connect</v-btn>
  </v-form>

  <v-layout v-else>
    <v-flex text-xs-center lg6 offset-lg3>
      <v-form v-on:submit.prevent="connectAndEmitHostChanged">
        <v-layout>
          <v-flex d-inline-flex>
            <v-text-field solo
                          title="Host"
                          label="Host"
                          id="host"
                          type="text"
                          v-model="elasticsearchHost"
                          append-icon="clear"
                          :append-icon-cb="resetElasticsearchHost"></v-text-field>
            <v-btn type="submit">Connect</v-btn>
          </v-flex>
        </v-layout>
      </v-form>
    </v-flex>
  </v-layout>
</template>

<script>
  import ConnectWithServer from '../../mixins/ConnectWithServer'
  import { DEFAULT_HOST } from '../../consts'

  export default {
    name: 'Connect',
    props: {
      isToolbar: Boolean
    },
    computed: {
      elasticsearchHost: {
        get () {
          return this.$store.state.connection.elasticsearchHost
        },
        set (value) {
          this.$store.commit('setElasticsearchHost', value)
        }
      }
    },
    methods: {
      resetElasticsearchHost () {
        this.elasticsearchHost = DEFAULT_HOST
      },
      connectAndEmitHostChanged () {
        this.connectWithServer(() => this.$emit('hostChanged'))
      }
    },
    mixins: [ConnectWithServer]
  }
</script>
