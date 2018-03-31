<template>
  <div class="display-flex align-center" v-if="useToolbar">
    <v-toolbar-items>
      <v-text-field solo
                    title="Host"
                    type="text"
                    v-model="elasticsearchHost"
                    append-icon="clear"
                    :append-icon-cb="resetElasticsearchHost"></v-text-field>
    </v-toolbar-items>
    <v-btn type="submit" v-on:click="connectWithServer">Connect</v-btn>
  </div>

  <v-container v-else>
    <v-layout row wrap>
      <v-flex text-xs-center xs6 offset-xs3>
        <v-layout row wrap>
          <v-flex>
            <v-text-field solo
                          title="Host"
                          type="text"
                          v-model="elasticsearchHost"
                          append-icon="clear"
                          :append-icon-cb="resetElasticsearchHost"></v-text-field>
          </v-flex>
          <v-flex>
            <v-btn type="submit" v-on:click="connectWithServer">Connect</v-btn>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import ConnectWithServer from '../../mixins/ConnectWithServer'
  import { DEFAULT_HOST } from '../../consts'

  export default {
    props: ['useToolbar'],
    mixins: [ConnectWithServer],
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
      }
    }
  }
</script>
