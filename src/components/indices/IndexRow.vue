<template>
  <tr>
    <td>
      <slot name="checkbox" />
    </td>
    <td :title="index.index">
      <a :title="$t('indices.index_row.search.title', {index: index.index})"
         @click.stop="showDocuments(index.index)">
        {{ index.index }}
      </a>
    </td>
    <td>
      <svg height="14" width="14">
        <circle :class="`health--${index.health}`" cx="7" cy="9" r="5" />
      </svg>
      {{ index.health }}
    </td>
    <td>{{ index.status }}</td>
    <td>{{ index.uuid }}</td>
    <td :title="aliases.join('\n')">
      <q-circular-progress v-if="requestState.loading" indeterminate rounded color="primary" />
      <template v-else>
        [
        <span v-for="(alias, i) in aliases" :key="`${index}-alias-${alias}`">
          <a :key="alias"
             :title="$t('indices.index_row.search.title', {index: alias})"
             @click.stop="showDocuments(alias)">{{ alias }}
          </a>
          <span v-if="i !== aliases.length-1">, </span>
        </span>
        ]
      </template>
    </td>
    <td class="text-right">
      <div :title="$t('indices.index_row.shards.title', {pri: index.pri, rep: index.rep})">
        {{ index.pri }} / {{ index.rep }}
      </div>
    </td>
    <td class="text-right">
      {{ index.parsedDocsCount }}
    </td>
    <td class="text-right">
      {{ index.humanStoreSize }}
    </td>
    <td>
      <q-btn-group>
        <q-btn icon="search" color="dark-grey" />
        <q-btn-dropdown ref="menu" icon="settings" color="dark-grey">
          <q-list padding dense>
            <q-item clickable @click="openModalWith('indexGet', {index: index.index})">
              <q-item-section side>
                <q-icon name="info" size="xs" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('indices.index_row.options.show_info') }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable @click="openModalWith('indexStats', {index: index.index})">
              <q-item-section side>
                <q-icon name="show_chart" size="xs" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ $t('indices.index_row.options.show_stats') }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator />

            <index-aliases :index="index.index" @reload="remitReloadAndCloseMenu" />

            <q-separator />

            <index-row-menu-action method="indexForcemerge"
                                   :index="index.index"
                                   :text="$t('indices.index_row.options.forcemerge.text')"
                                   :growl="$t('indices.index_row.options.forcemerge.growl', {index: index.index})"
                                   icon="call_merge"
                                   @done="remitReloadAndCloseMenu" />

            <index-row-menu-action method="indexRefresh"
                                   :index="index.index"
                                   :text="$t('indices.index_row.options.refresh.text')"
                                   :growl="$t('indices.index_row.options.refresh.growl', {index: index.index})"
                                   icon="refresh"
                                   @done="remitReloadAndCloseMenu" />

            <index-row-menu-action method="indexFlush"
                                   :index="index.index"
                                   :text="$t('indices.index_row.options.flush.text')"
                                   :growl="$t('indices.index_row.options.flush.growl', {index: index.index})"
                                   icon="archive"
                                   @done="remitReloadAndCloseMenu" />

            <index-row-menu-action method="indexClearCache"
                                   :index="index.index"
                                   :text="$t('indices.index_row.options.clear_cache.text')"
                                   :growl="$t('indices.index_row.options.clear_cache.growl', {index: index.index})"
                                   icon="clear_all"
                                   @done="remitReloadAndCloseMenu" />

            <q-separator />

            <index-row-menu-action v-if="index.status === 'open'"
                                   method="indexClose"
                                   :index="index.index"
                                   :text="$t('indices.index_row.options.close.text')"
                                   :growl="$t('indices.index_row.options.close.growl', {index: index.index})"
                                   icon="lock"
                                   @done="remitReloadAndCloseMenu" />
            <index-row-menu-action v-else
                                   method="indexOpen"
                                   :index="index.index"
                                   :text="$t('indices.index_row.options.open.text')"
                                   :growl="$t('indices.index_row.options.open.growl', {index: index.index})"
                                   icon="lock_open"
                                   @done="remitReloadAndCloseMenu" />

            <index-row-menu-action method="indexDelete"
                                   :index="index.index"
                                   :text="$t('indices.index_row.options.delete.text')"
                                   :growl="$t('indices.index_row.options.delete.growl', {index: index.index})"
                                   :confirm="$t('indices.index_row.options.delete.confirm', {index: index.index})"
                                   icon="delete"
                                   @done="remitReloadAndCloseMenu" />
          </q-list>
        </q-btn-dropdown>
      </q-btn-group>
    </td>
  </tr>
</template>

<script setup>
  import { onMounted, ref, watch } from 'vue'
  import IndexAliases from './IndexAliases.vue'
  import IndexRowMenuAction from './IndexRowMenuAction.vue'
  import { useModal } from '../../composables/Modal'
  import { useElasticsearchRequest } from '../../composables/CallElasticsearch'

  const props = defineProps({
    index: {
      default: () => ({}),
      type: Object
    }
  })
  const emit = defineEmits(['reload'])
  const menu = ref(null)
  const aliases = ref([])

  const { openModalWith } = useModal()
  const { requestState, data, load } = useElasticsearchRequest('indexGetAlias', { index: props.index.index })
  const loadAliases = () => {
    load().then(() => {
      if (!data.value[props.index.index] || !data.value[props.index.index].aliases) {
        aliases.value = []
      } else {
        aliases.value = Object.keys(data.value[props.index.index].aliases).sort()
      }
    })
  }
  onMounted(loadAliases)
  watch(() => props.index, loadAliases)

  const remitReloadAndCloseMenu = () => {
    emit('reload')
    menu.value.hide()
  }

  const showDocuments = index => {
    console.log(index)
  }
</script>
