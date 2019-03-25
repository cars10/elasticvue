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
            <list-tile-modal-link :action="() => openIndicesGetModal(index.index)"
                                  :to="{name: 'Index', params: {index: index.index}}"
                                  icon="info" link-title="Show info"/>

            <list-tile-modal-link :action="() => openIndicesStatsModal(index.index)"
                                  :to="{name: 'IndexStats', params: {index: index.index}}"
                                  icon="show_chart" link-title="Show stats"/>

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
    </td>
  </tr>
</template>

<script>
  import { openModal } from '@/mixins/OpenModal'
  import BtnGroup from '@/components/shared/BtnGroup'
  import ListTileLink from '@/components/shared/ListTile/ListTileLink'
  import ListTileModalLink from '@/components/shared/ListTile/ListTileModalLink'

  export default {
    name: 'index-row',
    components: {
      BtnGroup,
      ListTileLink,
      ListTileModalLink
    },
    props: {
      index: {
        default: () => {
          return {}
        },
        type: Object
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
      openIndicesGetModal (indexName) {
        openModal({
          method: 'indicesGet',
          methodParams: { index: indexName },
          title: 'indicesGet',
          subtitle: indexName
        })
      },
      openIndicesStatsModal (indexName) {
        openModal({
          method: 'indicesStats',
          methodParams: { index: indexName },
          title: 'indicesStats',
          subtitle: indexName
        })
      }
    }
  }
</script>
