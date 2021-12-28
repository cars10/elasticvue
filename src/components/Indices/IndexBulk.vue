<template>
  <div>
    <v-menu top offset-y>
      <template v-slot:activator="{on}">
        <v-btn v-on="on" :disabled="selectedIndices.length === 0" color="success">
          Bulk action
          <v-icon small>mdi-menu-down</v-icon>
        </v-btn>
      </template>
      <v-list>
        <list-tile-link :callback="emitReloadIndices"
                        :link-title="$t('indices.index_row.options.forcemerge.text')"
                        :method-params="{index: selectedIndices}" icon="mdi-call-merge"
                        method="indexForcemerge"/>
        <list-tile-link :callback="emitReloadIndices"
                        :link-title="$t('indices.index_row.options.refresh.text')"
                        :method-params="{index: selectedIndices}" icon="mdi-refresh" method="indexRefresh"/>

        <list-tile-link :callback="emitReloadIndices"
                        :link-title="$t('indices.index_row.options.flush.text')"
                        :method-params="{index: selectedIndices}" icon="mdi-inbox-arrow-down"
                        method="indexFlush"/>

        <list-tile-link :callback="emitReloadIndices"
                        :link-title="$t('indices.index_row.options.clear_cache.text')"
                        :method-params="{index: selectedIndices}" icon="mdi-notification-clear-all"
                        method="indexClearCache"/>

        <v-divider/>

        <list-tile-link :callback="emitReloadIndices"
                        :link-title="$t('indices.index_row.options.close.text')"
                        :method-params="{index: selectedIndices}" icon="mdi-lock" method="indexClose"/>
        <list-tile-link :callback="emitReloadIndices"
                        :link-title="$t('indices.index_row.options.open.text')"
                        :method-params="{index: selectedIndices}" icon="mdi-lock-open" method="indexOpen"/>

        <list-tile-link :callback="emitIndicesDeleted"
                        :confirm-message="$t('indices.index_row.options.delete.confirm', {index: selectedIndices})"
                        :link-title="$t('indices.index_row.options.delete.text')"
                        :method-params="{index: selectedIndices}" icon="mdi-delete" method="indexDelete"/>
      </v-list>
    </v-menu>
    <div class="d-inline-block ml-4" :class="{'grey--text': selectedIndices.length === 0}">
      {{ selectedIndices.length }} / {{ itemsLength }} selected
      <template v-if="hasFilter">({{ indicesLength }} total)</template>
    </div>
  </div>
</template>

<script>
  import ListTileLink from '@/components/shared/ListTile/ListTileLink'

  export default {
    name: 'index-bulk',
    components: {
      ListTileLink
    },
    props: {
      selectedIndices: {
        default: () => ([]),
        type: Array
      },
      itemsLength: {
        default: 0,
        type: Number
      },
      indicesLength: {
        default: 0,
        type: Number
      },
      hasFilter: {
        default: false,
        type: Boolean
      }
    },
    setup (props, context) {
      const emitReloadIndices = () => (context.emit('reloadIndices'))
      const emitIndicesDeleted = () => (context.emit('indicesDeleted'))

      return {
        emitReloadIndices,
        emitIndicesDeleted
      }
    }
  }
</script>
