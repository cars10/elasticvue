<template>
  <tr>
    <td :title="index.index">{{index.index}}</td>
    <td>
      <svg height="14" width="14">
        <circle :class="`health--${index.health}`" cx="7" cy="9" r="5"/>
      </svg>
      {{index.health}}
    </td>
    <td>{{index.status}}</td>
    <td>{{index.uuid}}</td>
    <td :title="aliasesTitle">
      <template v-if="aliasesLoading">
        <i>loading</i>
      </template>
      <template v-else>
        {{aliases}}
      </template>
    </td>
    <td class="text-right">
      <span :title="`${index.pri} primary\n${index.rep} replica`">{{index.pri}} / {{index.rep}}</span>
    </td>
    <td class="text-right">{{index.docsCount}}</td>
    <td class="text-right">{{index.storeSize}}</td>
    <td>
      <btn-group small>
        <v-btn title="Search documents" @click.native.stop="showDocuments(index.index)">
          <v-icon>mdi-magnify</v-icon>
        </v-btn>

        <v-menu left offset-y>
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

            <list-tile-link :callback="emitReloadIndices" :growl="`The index '${index.index}' was successfully merged.`"
                            :method-params="{index: index.index}"
                            icon="mdi-call-merge" link-title="Forcemerge index" method="indicesForcemerge"/>

            <list-tile-link :callback="emitReloadIndices"
                            :growl="`The index '${index.index}' was successfully refreshed.`"
                            :method-params="{index: index.index}"
                            icon="mdi-refresh" link-title="Refresh index" method="indicesRefresh"/>

            <list-tile-link :callback="emitReloadIndices"
                            :growl="`The index '${index.index}' was successfully flushed.`"
                            :method-params="{index: index.index}"
                            icon="mdi-inbox-arrow-down" link-title="Flush index" method="indicesFlush"/>

            <list-tile-link :callback="emitReloadIndices"
                            :growl="`The index '${index.index}' cache was successfully cleared.`"
                            :method-params="{index: index.index}"
                            icon="mdi-notification-clear-all" link-title="Clear index cache"
                            method="indicesClearCache"/>

            <v-divider/>

            <list-tile-link v-if="index.status === 'open'"
                            :callback="emitReloadIndices" :growl="`The index '${index.index}' was successfully closed.`"
                            :method-params="{index: index.index}"
                            icon="mdi-lock" link-title="Close index" method="indicesClose"/>
            <list-tile-link v-else :callback="emitReloadIndices"
                            :growl="`The index '${index.index}' was successfully opened.`"
                            :method-params="{index: index.index}"
                            icon="mdi-lock-open" link-title="Open index" method="indicesOpen"/>

            <list-tile-link :callback="emitReloadIndices"
                            :growl="`The index '${index.index}' was successfully deleted.`"
                            :method-params="{index: index.index}"
                            confirm-message="Are you sure? This will remove ALL data in your index!"
                            icon="mdi-delete" link-title="Delete index" method="indicesDelete"/>
          </v-list>
        </v-menu>
      </btn-group>

      <modal-data-loader :method="modalMethod"
                         :method-params="{ index: this.index.index }"
                         :modal-subtitle="index.index"
                         :modal-title="modalTitle"
                         v-model="modalOpen"/>
    </td>
  </tr>
</template>

<script>
  import BtnGroup from '@/components/shared/BtnGroup'
  import ListTileLink from '@/components/shared/ListTile/ListTileLink'
  import ModalDataLoader from '@/components/shared/ModalDataLoader'
  import esAdapter from '@/mixins/GetAdapter'

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
        modalTitle: '',
        aliases: [],
        aliasesLoading: true
      }
    },
    computed: {
      aliasesTitle () {
        return this.aliases.join('\n')
      }
    },
    watch: {
      index () {
        this.loadAliases()
      }
    },
    mounted () {
      this.loadAliases()
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
      },
      async loadAliases () {
        this.aliasesLoading = true
        let adapter = await esAdapter()
        adapter.indexGetAlias({ index: this.index.index }).then(r => {
          if (!r[this.index.index] || !r[this.index.index].aliases) {
            this.aliases = []
          } else {
            this.aliases = Object.keys(r[this.index.index].aliases).sort()
          }
          this.aliasesLoading = false
        })
      }
    }
  }
</script>
