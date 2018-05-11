<template>
  <v-form class="display-flex align-center" v-if="isToolbar" v-on:submit.prevent="connectAndEmitHostChanged">
    <v-toolbar-items>
      <v-text-field solo
                    title="Host"
                    type="text"
                    v-model="elasticsearchHost"
                    append-icon="clear"
                    :append-icon-cb="resetElasticsearchHost"></v-text-field>
    </v-toolbar-items>
    <v-btn type="submit">Connect</v-btn>
  </v-form>

  <v-container v-else>
    <v-layout row wrap>
      <v-flex text-xs-center xs6 offset-xs3>
        <v-form v-on:submit.prevent="connectAndEmitHostChanged">
          <v-layout row wrap>
            <v-flex d-inline-flex>
              <v-text-field solo
                            title="Host"
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
  </v-container>
</template>

<script>
  import ConnectWithServer from '../../mixins/ConnectWithServer'
  import { DEFAULT_HOST } from '../../consts'

  export default {
    props: {
      isToolbar: Boolean
    },
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
      },
      connectAndEmitHostChanged () {
        this.connectWithServer(() => this.$emit('hostChanged'))
      }
    }
  }
</script>
