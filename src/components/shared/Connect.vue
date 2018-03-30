<template>
  <div class="display-flex align-center" v-if="useToolbar">
    <v-toolbar-items>
      <v-text-field title="Host" type="text" auto-grow v-model="elasticsearchHost"></v-text-field>
    </v-toolbar-items>
    <v-btn type="submit" v-on:click="connectWithClient">Connect</v-btn>
  </div>

  <v-container v-else>
    <v-layout row wrap>
      <v-flex text-xs-center xs6 offset-xs3>
        <v-layout row wrap>
          <v-flex>
            <v-text-field title="Host" type="text" v-model="elasticsearchHost"></v-text-field>
          </v-flex>
          <v-flex>
            <v-btn type="submit" v-on:click="connectWithClient">Connect</v-btn>
          </v-flex>
        </v-layout>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import ConnectMixin from '../../mixins/ConnectMixin'

  export default {
    props: ['useToolbar'],
    mixins: [ConnectMixin],
    computed: {
      elasticsearchHost: {
        get () {
          return this.$store.state.connection.elasticsearchHost
        },
        set (value) {
          this.$store.commit('setElasticsearchHost', value)
        }
      }
    }
  }
</script>
