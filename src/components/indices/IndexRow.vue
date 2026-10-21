<template>
  <tr>
    <td>
      <slot name="checkbox" />
    </td>
    <td :title="index.index">
      <a
        class="text-weight-medium"
        :title="t('indices.index_row.search.title', { index: index.index })"
        @click.stop="showDocuments(index.index)"
        >{{ index.index }}</a
      >
    </td>
    <td>
      <div class="row items-center no-wrap">
        <svg height="14" width="14" class="q-mr-xs">
          <circle :class="`health--${index.health}`" cx="7" cy="7" r="5" />
        </svg>
        {{ index.health }}
      </div>
    </td>
    <td>
      <div class="row items-center no-wrap">
        <span class="q-mr-sm" :class="{ 'text-muted': index.status !== 'open' }">{{ index.status }}</span>
        <q-badge v-if="index.blocks?.readOnlyAllowDelete" color="negative" label="read-only" data-testid="index-read-only">
          <q-tooltip>Blocked by the flood-stage disk watermark (read_only_allow_delete)</q-tooltip>
        </q-badge>
        <q-badge v-else-if="readOnly" outline color="warning" label="read-only" data-testid="index-read-only" />
      </div>
    </td>
    <td class="text-muted">{{ index.uuid }}</td>
    <td :title="index.aliases?.join('\n')">
      <div v-if="index.aliases?.length" class="row no-wrap">
        <q-badge
          v-for="alias in index.aliases"
          :key="alias"
          outline
          color="primary"
          class="cursor-pointer q-mr-xs"
          :label="alias"
          :title="t('indices.index_row.search.title', { index: alias })"
          @click.stop="showDocuments(alias)"
        />
      </div>
    </td>
    <td class="text-right">
      <div :title="t('indices.index_row.shards.title', { pri: index.pri, rep: index.rep })">
        {{ index.pri }}p&nbsp;&nbsp;{{ index.rep }}r
      </div>
    </td>
    <td class="text-right">
      {{ index.parsedSegmentsCount }}
    </td>
    <td class="text-right">
      {{ index.parsedDocsCount }}
    </td>
    <td class="text-right">
      {{ index.humanStoreSize }}
    </td>
    <td>
      <template v-if="index.created && typeof index.created === 'number'">
        <div>{{ new Date(index.created).toLocaleDateString() }}</div>
        <div class="text-muted font-13">{{ new Date(index.created).toLocaleTimeString() }}</div>
      </template>
    </td>
    <td class="text-right text-no-wrap">
      <q-btn flat round dense icon="search" @click="showDocuments(index.index)" />
      <q-btn flat round dense icon="more_vert" data-testid="index-row-menu">
        <q-menu ref="menu">
          <q-list padding dense>
            <q-item clickable @click="openModalWith('indexGet', { index: index.index })">
              <q-item-section side>
                <q-icon name="info" size="xs" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ t('indices.index_row.options.show_info') }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable @click="openModalWith('indexStats', { index: index.index })">
              <q-item-section side>
                <q-icon name="show_chart" size="xs" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ t('indices.index_row.options.show_stats') }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-separator />

            <index-aliases :index="index.index" @reload="emitReloadAndCloseMenu" />
            <index-reindex v-if="clusterVersionGt(1)" :index="index.index" @reload="emitReloadAndCloseMenu" />
            <index-clone v-if="clusterVersionGte(7)" :index="index.index" @reload="emitReloadAndCloseMenu" />

            <q-separator />

            <row-menu-action
              v-if="clusterVersionGt(1) && !connectionStore.serverless"
              method="indexForcemerge"
              :method-params="{ indices: [props.index.index] }"
              :text="t('indices.index_row.options.forcemerge.text')"
              :growl="t('indices.index_row.options.forcemerge.growl', { index: index.index })"
              icon="call_merge"
              @done="emitReloadAndCloseMenu"
            />

            <row-menu-action
              method="indexRefresh"
              :method-params="{ indices: [props.index.index] }"
              :text="t('indices.index_row.options.refresh.text')"
              :growl="t('indices.index_row.options.refresh.growl', { index: index.index })"
              icon="refresh"
              @done="emitReloadAndCloseMenu"
            />

            <row-menu-action
              method="indexFlush"
              :method-params="{ indices: [props.index.index] }"
              :text="t('indices.index_row.options.flush.text')"
              :growl="t('indices.index_row.options.flush.growl', { index: index.index })"
              icon="archive"
              @done="emitReloadAndCloseMenu"
            />

            <row-menu-action
              method="indexClearCache"
              :method-params="{ indices: [props.index.index] }"
              :text="t('indices.index_row.options.clear_cache.text')"
              :growl="t('indices.index_row.options.clear_cache.growl', { index: index.index })"
              icon="clear_all"
              @done="emitReloadAndCloseMenu"
            />

            <row-menu-action
              v-if="!readOnly || index.blocks === null"
              method="indexPutSettings"
              :method-params="{ indices: [props.index.index], body: { index: { blocks: { write: true } } } }"
              :text="t('indices.index_row.options.set_readonly.text')"
              :growl="t('indices.index_row.options.set_readonly.growl', { index: index.index })"
              :confirm="t('indices.index_row.options.set_readonly.confirm', { index: index.index })"
              icon="lock"
              @done="emitReloadAndCloseMenu"
            />

            <row-menu-action
              v-if="readOnly || index.blocks === null"
              method="indexPutSettings"
              :method-params="{ indices: [props.index.index], body: writableSettingsBody(index.blocks) }"
              :text="t('indices.index_row.options.set_writable.text')"
              :growl="t('indices.index_row.options.set_writable.growl', { index: index.index })"
              icon="lock_open"
              @done="emitReloadAndCloseMenu"
            />

            <row-menu-action
              v-if="index.status === 'open' && !connectionStore.serverless"
              method="indexClose"
              :method-params="{ indices: [props.index.index] }"
              :confirm="t('indices.index_row.options.close.confirm', { index: index.index })"
              :text="t('indices.index_row.options.close.text')"
              :growl="t('indices.index_row.options.close.growl', { index: index.index })"
              icon="lock"
              @done="emitReloadAndCloseMenu"
            />
            <row-menu-action
              v-else-if="!connectionStore.serverless"
              method="indexOpen"
              :method-params="{ indices: [props.index.index] }"
              :text="t('indices.index_row.options.open.text')"
              :growl="t('indices.index_row.options.open.growl', { index: index.index })"
              icon="lock_open"
              @done="emitReloadAndCloseMenu"
            />

            <q-separator />

            <row-menu-action
              v-if="clusterVersionGte(5)"
              method="deleteByQuery"
              :method-params="{ index: props.index.index }"
              :text="t('indices.index_row.options.delete_by_query.text')"
              :growl="t('indices.index_row.options.delete_by_query.growl', { index: index.index })"
              :confirm="t('indices.index_row.options.delete_by_query.confirm', { index: index.index })"
              icon="delete"
              @done="emitReloadAndCloseMenu"
            />

            <row-menu-action
              method="indexDelete"
              :method-params="{ indices: [props.index.index] }"
              :text="t('indices.index_row.options.delete.text')"
              :growl="t('indices.index_row.options.delete.growl', { index: index.index })"
              :confirm="t('indices.index_row.options.delete.confirm', { index: index.index })"
              icon="delete"
              @done="() => afterDelete(props.index.index)"
            />
          </q-list>
        </q-menu>
      </q-btn>
    </td>
  </tr>
</template>

<script setup lang="ts">
import IndexAliases from './IndexAliases.vue'
import { IndexRowProps, useIndexRow } from '../../composables/components/indices/IndexRow'
import { useTranslation } from '../../composables/i18n'
import IndexReindex from './IndexReindex.vue'
import IndexClone from './IndexClone.vue'
import RowMenuAction from './RowMenuAction.vue'
import { clusterVersionGt, clusterVersionGte } from '../../helpers/minClusterVersion.ts'
import { useConnectionStore } from '../../store/connection.ts'
import { isReadOnly, writableSettingsBody } from '../../helpers/indices.ts'
import { computed } from 'vue'

const t = useTranslation()
const props = defineProps<IndexRowProps>()
const emit = defineEmits(['reload', 'indexDeleted'])
const connectionStore = useConnectionStore()
const readOnly = computed(() => isReadOnly(props.index.blocks))

const afterDelete = (index: string) => {
  emit('indexDeleted', index)
  emitReloadAndCloseMenu()
}

const { openModalWith, emitReloadAndCloseMenu, showDocuments } = useIndexRow(props, emit)
</script>
