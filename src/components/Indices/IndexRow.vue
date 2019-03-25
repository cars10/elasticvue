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
          <v-icon>search</v-icon>
        </v-btn>

        <v-menu offset-y left>
          <v-btn slot="activator" title="Options">
            <v-icon>settings</v-icon>
            <v-icon small>arrow_drop_down</v-icon>
          </v-btn>
          <v-list>
            <router-link :to="{name: 'Index', params: {index: index.index}}" class="v-list__tile v-list__tile--link"
                         event="" @click.native.prevent="openIndicesGetModal">
              <v-list-tile-action>
                <v-icon small>info</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Show info</v-list-tile-title>
              </v-list-tile-content>
            </router-link>

            <router-link :to="{name: 'Index', params: {index: index.index}}" class="v-list__tile v-list__tile--link"
                         event="" @click.native.prevent="openIndicesStatsModal">
              <v-list-tile-action>
                <v-icon small>show_chart</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>Show stats</v-list-tile-title>
              </v-list-tile-content>
            </router-link>

            <v-divider/>

            <list-tile-link :method-params="{index: index.index}" :callback="emitReloadIndices"
                            :growl="`The index '${index.index}' was successfully merged.`"
                            method="indicesForcemerge" icon="merge_type" link-title="Forcemerge index"/>

            <list-tile-link :method-params="{index: index.index}" :callback="emitReloadIndices"
                            :growl="`The index '${index.index}' was successfully refreshed.`"
                            method="indicesRefresh" icon="refresh" link-title="Refresh index"/>

            <list-tile-link :method-params="{index: index.index}" :callback="emitReloadIndices"
                            :growl="`The index '${index.index}' was successfully flushed.`"
                            method="indicesFlush" icon="save_alt" link-title="Flush index"/>

            <list-tile-link :method-params="{index: index.index}" :callback="emitReloadIndices"
                            :growl="`The index '${index.index}' cache was successfully cleared.`"
                            method="indicesClearCache" icon="clear_all" link-title="Clear index cache"/>

            <v-divider/>

            <list-tile-link v-if="index.status === 'open'"
                            :method-params="{index: index.index}" :callback="emitReloadIndices"
                            :growl="`The index '${index.index}' was successfully closed.`"
                            method="indicesClose" icon="lock" link-title="Close index"/>
            <list-tile-link v-else :method-params="{index: index.index}" :callback="emitReloadIndices"
                            :growl="`The index '${index.index}' was successfully opened.`"
                            method="indicesOpen" icon="lock_open" link-title="Open index"/>

            <list-tile-link :method-params="{index: index.index}" :callback="emitReloadIndices"
                            :growl="`The index '${index.index}' was successfully deleted.`"
                            confirm-message="Are you sure? This will remove ALL data in your index!"
                            method="indicesDelete" icon="delete" link-title="Delete index"/>
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
