<template>
  <tr>
    <td :title="index.index">
      <a :title="`Search ${index.index}`" @click.stop="showDocuments(index.index)">{{ index.index }}</a>
    </td>
    <td>
      <svg height="14" width="14">
        <circle :class="`health--${index.health}`" cx="7" cy="9" r="5"/>
      </svg>
      {{ index.health }}
    </td>
    <td>{{ index.status }}</td>
    <td>{{ index.uuid }}</td>
    <td :title="aliasesTitle">
      <template v-if="requestState.loading">
        <i>loading</i>
      </template>
      <template v-else>
        [
        <span v-for="(alias, index) in aliases" :key="`${index}-alias-${alias}`">
          <a :key="alias" :title="`Search ${alias}`" @click.stop="showDocuments(alias)">{{ alias }}</a><span
          v-if="index !== aliases.length-1">, </span>
        </span>
        ]
      </template>
    </td>
    <td class="text-right">
      <span :title="`${index.pri} primary\n${index.rep} replica`">{{ index.pri }} / {{ index.rep }}</span>
    </td>
    <td class="text-right">{{ index.docsCount }}</td>
    <td class="text-right">{{ index.humanStoreSize }}</td>
    <td>
      <btn-group small>
        <v-btn v-if="index.status === 'open'" title="Search documents" @click.native.stop="showDocuments(index.index)">
          <v-icon>mdi-magnify</v-icon>
        </v-btn>

        <v-menu left offset-y>
          <template v-slot:activator="{on}">
            <v-btn title="Options" v-on="on">
              <v-icon>mdi-cog</v-icon>
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
                            icon="mdi-call-merge" link-title="Forcemerge index" method="indexForcemerge"/>

            <list-tile-link :callback="emitReloadIndices"
                            :growl="`The index '${index.index}' was successfully refreshed.`"
                            :method-params="{index: index.index}"
                            icon="mdi-refresh" link-title="Refresh index" method="indexRefresh"/>

            <list-tile-link :callback="emitReloadIndices"
                            :growl="`The index '${index.index}' was successfully flushed.`"
                            :method-params="{index: index.index}"
                            icon="mdi-inbox-arrow-down" link-title="Flush index" method="indexFlush"/>

            <list-tile-link :callback="emitReloadIndices"
                            :growl="`The index '${index.index}' cache was successfully cleared.`"
                            :method-params="{index: index.index}"
                            icon="mdi-notification-clear-all" link-title="Clear index cache"
                            method="indexClearCache"/>

            <v-divider/>

            <list-tile-link v-if="index.status === 'open'"
                            :callback="emitReloadIndices" :growl="`The index '${index.index}' was successfully closed.`"
                            :method-params="{index: index.index}"
                            icon="mdi-lock" link-title="Close index" method="indexClose"/>
            <list-tile-link v-else :callback="emitReloadIndices"
                            :growl="`The index '${index.index}' was successfully opened.`"
                            :method-params="{index: index.index}"
                            icon="mdi-lock-open" link-title="Open index" method="indexOpen"/>

            <list-tile-link :callback="emitReloadIndices"
                            :growl="`The index '${index.index}' was successfully deleted.`"
                            :method-params="{index: index.index}"
                            confirm-message="Are you sure? This will remove ALL data in your index!"
                            icon="mdi-delete" link-title="Delete index" method="indexDelete"/>
          </v-list>
        </v-menu>
      </btn-group>

      <modal-data-loader v-model="modalOpen"
                         :method="modalMethod"
                         :method-params="{ index: index.index }"
                         :modal-subtitle="index.index"
                         :modal-title="modalTitle"/>
    </td>
  </tr>
</template>

<script>
  import BtnGroup from '@/components/shared/BtnGroup'
  import ListTileLink from '@/components/shared/ListTile/ListTileLink'
  import ModalDataLoader from '@/components/shared/ModalDataLoader'
  import { computed, onMounted, ref, watch } from '@vue/composition-api'
  import store from '@/store'
  import { useElasticsearchRequest } from '@/mixins/RequestComposition'

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
    setup (props, context) {
      const modalOpen = ref(false)
      const modalMethod = ref('')
      const modalTitle = ref('')
      const aliases = ref([])

      const { requestState, callElasticsearch } = useElasticsearchRequest()

      const aliasesTitle = computed(() => {
        return aliases.value.join('\n')
      })

      const loadAliases = () => {
        callElasticsearch('indexGetAlias', { index: props.index.index })
          .then(r => {
            if (!r[props.index.index] || !r[props.index.index].aliases) {
              aliases.value = []
            } else {
              aliases.value = Object.keys(r[props.index.index].aliases).sort()
            }
          })
      }

      watch(() => props.index, loadAliases)
      onMounted(loadAliases)

      const showDocuments = (index) => {
        store.commit('search/setIndices', index)
        context.root.$router.push({ name: 'Search' })
      }

      const emitReloadIndices = () => {
        context.emit('reloadIndices')
      }
      const openIndicesGetModal = () => {
        modalMethod.value = 'indexGet'
        modalTitle.value = 'indicesGet'
        modalOpen.value = true
      }
      const openIndicesStatsModal = () => {
        modalMethod.value = 'indexStats'
        modalTitle.value = 'indicesStats'
        modalOpen.value = true
      }

      return {
        modalOpen,
        modalMethod,
        modalTitle,
        aliases,
        aliasesTitle,
        requestState,
        showDocuments,
        emitReloadIndices,
        openIndicesGetModal,
        openIndicesStatsModal
      }
    }
  }
</script>
