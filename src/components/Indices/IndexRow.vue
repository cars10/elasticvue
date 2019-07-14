<template>
  <tr>
    <td>{{index.index}}</td>
    <td>{{index.health}}</td>
    <td>{{index.status}}</td>
    <td>{{index.uuid}}</td>
    <td class="text-xs-right">{{index.pri}}</td>
    <td class="text-xs-right">{{index.rep}}</td>
    <td class="text-xs-right">{{index.docsCount}}</td>
    <td class="text-xs-right">{{index.storeSize}}</td>
    <td class="text-xs-right">{{index.priStoreSize}}</td>
    <td>
      <btn-group small>
        <v-btn title="Search documents" @click.native.stop="showDocuments(index.index)">
          <v-icon>mdi-magnify</v-icon>
        </v-btn>

        <v-menu offset-y left>
          <template v-slot:activator="{on}">
            <v-btn title="Options" v-on="on">
              <v-icon>mdi-settings</v-icon>
              <v-icon small>mdi-menu-down</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="openIndicesGetModal">
              <v-list-item-action>
                <v-icon small>mdi-information</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Show info</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item @click="openIndicesStatsModal">
              <v-list-item-action>
                <v-icon small>mdi-chart-line-variant</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Show stats</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-divider/>

            <list-tile-link :method-params="{index: index.index}" :callback="emitReloadIndices"
                            :growl="`The index '${index.index}' was successfully merged.`"
                            method="indicesForcemerge" icon="mdi-call-merge" link-title="Forcemerge index"/>

            <list-tile-link :method-params="{index: index.index}" :callback="emitReloadIndices"
                            :growl="`The index '${index.index}' was successfully refreshed.`"
                            method="indicesRefresh" icon="mdi-refresh" link-title="Refresh index"/>

            <list-tile-link :method-params="{index: index.index}" :callback="emitReloadIndices"
                            :growl="`The index '${index.index}' was successfully flushed.`"
                            method="indicesFlush" icon="mdi-inbox-arrow-down" link-title="Flush index"/>

            <list-tile-link :method-params="{index: index.index}" :callback="emitReloadIndices"
                            :growl="`The index '${index.index}' cache was successfully cleared.`"
                            method="indicesClearCache" icon="mdi-notification-clear-all"
                            link-title="Clear index cache"/>

            <v-divider/>

            <list-tile-link v-if="index.status === 'open'"
                            :method-params="{index: index.index}" :callback="emitReloadIndices"
                            :growl="`The index '${index.index}' was successfully closed.`"
                            method="indicesClose" icon="mdi-lock" link-title="Close index"/>
            <list-tile-link v-else :method-params="{index: index.index}" :callback="emitReloadIndices"
                            :growl="`The index '${index.index}' was successfully opened.`"
                            method="indicesOpen" icon="mdi-lock-open" link-title="Open index"/>

            <list-tile-link :method-params="{index: index.index}" :callback="emitReloadIndices"
                            :growl="`The index '${index.index}' was successfully deleted.`"
                            confirm-message="Are you sure? This will remove ALL data in your index!"
                            method="indicesDelete" icon="mdi-delete" link-title="Delete index"/>
          </v-list>
        </v-menu>
      </btn-group>

      <modal-data-loader v-model="modalOpen"
                         :method-params="{ index: this.index.index }"
                         :method="modalMethod"
                         :modal-title="modalTitle"
                         :modal-subtitle="index.index"/>
    </td>
  </tr>
</template>

<script>
  import BtnGroup from '@/components/shared/BtnGroup'
  import ListTileLink from '@/components/shared/ListTile/ListTileLink'
  import ModalDataLoader from '@/components/shared/ModalDataLoader'

  export default {
    name: 'index-row',
    components: {
      BtnGroup,
      ListTileLink,
      ModalDataLoader
    },
    props: {
      index: {
        default: () => {
          return {}
        },
        type: Object
      }
    },
    data () {
      return {
        modalOpen: false,
        modalMethod: '',
        modalTitle: ''
      }
    },
    methods: {
      showDocuments (index) {
        this.$store.commit('search/setIndices', [index]) // to pre-select right index on "Search" page
        this.$router.push({ name: 'Search', params: { executeSearch: true } })
      },
      emitReloadIndices () {
        this.$emit('reloadIndices')
      },
      openIndicesGetModal () {
        this.modalMethod = 'indicesGet'
        this.modalTitle = 'indicesGet'
        this.modalOpen = true
      },
      openIndicesStatsModal () {
        this.modalMethod = 'indicesStats'
        this.modalTitle = 'indicesStats'
        this.modalOpen = true
      }
    }
  }
</script>
