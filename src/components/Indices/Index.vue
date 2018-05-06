<template>
  <v-layout>
    <v-flex xs6 offset-xs3>
      <v-card>
        <v-card-title>
          <h2>Index</h2>
          <reload-button alignLeft :action="loadIndex"></reload-button>
          <back-button route="/indices"></back-button>
        </v-card-title>
        <v-divider></v-divider>

        <content-or-loading :loading="loading">
          <v-card-text>
            <vue-print-object :printableObject="index" v-if="index"></vue-print-object>
          </v-card-text>
        </content-or-loading>
      </v-card>
    </v-flex>
  </v-layout>
</template>

<script>
  import ReloadButton from '@/components/shared/ReloadButton'
  import BackButton from '@/components/shared/BackButton'
  import VuePrintObject from 'vue-print-object'

  export default {
    data () {
      return {
        index: {
          default: () => {
          }
        },
        loading: {
          default: false
        }
      }
    },
    components: {
      VuePrintObject,
      ReloadButton,
      BackButton
    },
    created () {
      this.loadIndex()
    },
    methods: {
      loadIndex () {
        this.loading = true
        const index = this.$route.params.index
        this.getElasticsearchAdapter().then(adapter => adapter.indicesGet(index)).then(
          body => {
            this.index = body
            this.loading = false
          }
        ).catch(error => this.$store.commit('setErrorState', error))
      }
    }
  }
</script>
