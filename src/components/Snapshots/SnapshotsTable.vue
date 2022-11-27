<template>
  <div>
    <v-card-text>
      <v-row>
        <v-col>
          <new-snapshot :repository="repository" @reloadData="emitReloadSnapshots"/>
        </v-col>
        <v-col>
          <div class="float-right d-inline-flex">
            <v-text-field id="filter"
                          v-model="filter"
                          :label="$t('snapshots.snapshots_table_wrapper.filter.label')"
                          append-icon="mdi-magnify"
                          autofocus
                          class="mt-0 pt-0 v-text-field--small"
                          hide-details
                          name="filter"
                          @keyup.esc="filter = ''"/>
          </div>
        </v-col>
      </v-row>
    </v-card-text>

    <v-data-table :footer-props="{itemsPerPageOptions: DEFAULT_ITEMS_PER_PAGE, showFirstLastPage: true}"
                  :headers="HEADERS"
                  :items="items"
                  :loading="loading"
                  :options.sync="pagination"
                  class="table--condensed"
                  item-key="id">
      <template v-slot:item="props">
        <snapshot :repository="repository" :snapshot="props.item" @reloadData="emitReloadSnapshots"/>
      </template>

      <template slot="no-data">
        <template v-if="!repository">
          {{ $t('snapshots.snapshots_table.no_repository_selected') }}
        </template>

        <template v-else>
          <template v-if="filter">
            {{ $t('shared.nothing_found_for_filter', { filter }) }}
          </template>
          <template v-else>
            {{ $t('shared.nothing_found') }}
          </template>
        </template>
      </template>
    </v-data-table>
  </div>
</template>

<script>
  import { DEFAULT_ITEMS_PER_PAGE } from '@/consts'
  import { vuexAccessors } from '@/helpers/store'
  import { computed } from 'vue'
  import Snapshot from '@/components/Snapshots/Snapshot'
  import { filterItems } from '@/helpers/filters'
  import i18n from '@/i18n'
  import NewSnapshot from '@/components/Snapshots/NewSnapshot'

  export default {
    name: 'snapshots-table',
    components: {
      NewSnapshot,
      Snapshot
    },
    props: {
      snapshots: {
        type: [Array, Object],
        default: () => {
          return []
        }
      },
      loading: {
        type: Boolean,
        default: true
      },
      repository: {
        type: String,
        default: ''
      }
    },
    setup (props, context) {
      const { filter } = vuexAccessors('snapshots', ['filter'])

      const { pagination } = vuexAccessors('snapshots', ['pagination'])
      const HEADERS = [
        { text: 'id', value: 'id' },
        { text: i18n.t('snapshots.snapshots_table.table.headers.status'), value: 'status' },
        { text: i18n.t('snapshots.snapshots_table.table.headers.start_time'), value: 'start_time' },
        { text: i18n.t('snapshots.snapshots_table.table.headers.end_time'), value: 'end_time' },
        { text: i18n.t('snapshots.snapshots_table.table.headers.duration'), value: 'duration' },
        { text: i18n.t('snapshots.snapshots_table.table.headers.indices'), value: 'indices' },
        { text: i18n.t('snapshots.snapshots_table.table.headers.successful_shards'), value: 'successful_shards' },
        { text: i18n.t('snapshots.snapshots_table.table.headers.failed_shards'), value: 'failed_shards' },
        { text: i18n.t('snapshots.snapshots_table.table.headers.total_shards'), value: 'total_shards' },
        { text: '', value: 'actions', sortable: false }
      ]

      const items = computed(() => {
        return filterItems(props.snapshots, filter.value, ['id'])
      })

      const emitReloadSnapshots = () => {
        context.emit('reloadData')
      }

      return {
        pagination,
        items,
        emitReloadSnapshots,
        DEFAULT_ITEMS_PER_PAGE,
        HEADERS,
        filter
      }
    }
  }
</script>
