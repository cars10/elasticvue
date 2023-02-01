<template>
  <tr>
    <td>
      <slot name="checkbox"></slot>
    </td>
    <td :title="index.index">
      <a :title="$t('indices.index_row.search.title', {index: index.index})"
         @click.stop="showDocuments(index.index)">
        {{ index.index }}
      </a>
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
      <v-progress-circular v-if="requestState.loading" indeterminate size="24" color="primary"/>
      <template v-else>
        [
        <span v-for="(alias, index) in aliases" :key="`${index}-alias-${alias}`">
          <a :key="alias"
             :title="$t('indices.index_row.search.title', {index: alias})"
             @click.stop="showDocuments(alias)">{{ alias }}
          </a>
          <span v-if="index !== aliases.length-1">, </span>
        </span>
        ]
      </template>
    </td>
    <td class="text-right">
      <div :title="$t('indices.index_row.shards.title', {pri: index.pri, rep: index.rep})">
        {{ index.pri }} / {{ index.rep }}
      </div>
    </td>
    <td class="text-right">{{ index.docsCount }}</td>
    <td class="text-right">{{ index.humanStoreSize }}</td>
    <td>
      <btn-group small>
        <v-btn v-if="index.status === 'open'"
               :title="$t('indices.index_row.search.title', {index: index.index})"
               @click.native.stop="showDocuments(index.index)">
          <v-icon>mdi-magnify</v-icon>
        </v-btn>

        <v-menu left offset-y>
          <template v-slot:activator="{on}">
            <v-btn v-on="on" :title="$t('indices.index_row.options.title')">
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
                <v-list-item-title>{{ $t('indices.index_row.options.show_info') }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-list-item @click="openIndicesStatsModal">
              <v-list-item-action>
                <v-icon small>mdi-chart-line-variant</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>{{ $t('indices.index_row.options.show_stats') }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>

            <v-divider/>
            <index-aliases :index-name="index.index" @reload="emitReloadIndices"/>
            <v-divider/>

            <list-tile-link :callback="emitReloadIndices"
                            :growl="$t('indices.index_row.options.forcemerge.growl', {index: index.index})"
                            :link-title="$t('indices.index_row.options.forcemerge.text')"
                            :method-params="{index: index.index}" icon="mdi-call-merge"
                            method="indexForcemerge"/>

            <list-tile-link :callback="emitReloadIndices"
                            :growl="$t('indices.index_row.options.refresh.growl', {index: index.index})"
                            :link-title="$t('indices.index_row.options.refresh.text')"
                            :method-params="{index: index.index}" icon="mdi-refresh" method="indexRefresh"/>

            <list-tile-link :callback="emitReloadIndices"
                            :growl="$t('indices.index_row.options.flush.growl', {index: index.index})"
                            :link-title="$t('indices.index_row.options.flush.text')"
                            :method-params="{index: index.index}" icon="mdi-inbox-arrow-down"
                            method="indexFlush"/>

            <list-tile-link :callback="emitReloadIndices"
                            :growl="$t('indices.index_row.options.clear_cache.growl', {index: index.index})"
                            :link-title="$t('indices.index_row.options.clear_cache.text')"
                            :method-params="{index: index.index}" icon="mdi-notification-clear-all"
                            method="indexClearCache"/>

            <v-divider/>

            <list-tile-link v-if="index.status === 'open'"
                            :callback="emitReloadIndices"
                            :growl="$t('indices.index_row.options.close.growl', {index: index.index})"
                            :link-title="$t('indices.index_row.options.close.text')"
                            :method-params="{index: index.index}" icon="mdi-lock" method="indexClose"/>
            <list-tile-link v-else
                            :callback="emitReloadIndices"
                            :growl="$t('indices.index_row.options.open.growl', {index: index.index})"
                            :link-title="$t('indices.index_row.options.open.text')"
                            :method-params="{index: index.index}" icon="mdi-lock-open" method="indexOpen"/>

            <list-tile-link :callback="emitReloadIndices"
                            :confirm-message="$t('indices.index_row.options.delete.confirm', {index: index.index})"
                            :growl="$t('indices.index_row.options.delete.growl', {index: index.index})"
                            :link-title="$t('indices.index_row.options.delete.text')"
                            :method-params="{index: index.index}" icon="mdi-delete" method="indexDelete"/>
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
  import { computed, onMounted, ref, watch } from 'vue'
  import store from '@/store'
  import { useElasticsearchRequest } from '@/mixins/RequestComposition'
  import IndexAliases from '@/components/Indices/IndexAliases'
  import { DEFAULT_SEARCH_QUERY } from '@/consts'
  import { useRouter } from '@/helpers/composition'

  export default {
    name: 'index-row',
    components: {
      BtnGroup,
      ListTileLink,
      ModalDataLoader,
      IndexAliases
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

      const { router } = useRouter()
      const showDocuments = index => {
        store.commit('search/setIndices', index)
        store.commit('search/setQ', '*')
        store.commit('search/setSearchQuery', DEFAULT_SEARCH_QUERY)
        router.push({ name: 'Search' })
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
