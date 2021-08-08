<template>
  <v-data-table :footer-props="{itemsPerPageOptions: DEFAULT_ITEMS_PER_PAGE, showFirstLastPage: true}"
                :headers="HEADERS"
                :items="items"
                :loading="loading"
                :options.sync="pagination"
                class="table--condensed"
                item-key="id">
    <template v-slot:item="props">
      <snapshot :repository="repository" :snapshot="props.item" @reloadData="emitReloadData"/>
    </template>

    <template slot="no-data">
      <template v-if="!repository">
        {{ $t('snapshots.snapshots_table.no_repository_selected') }}
      </template>

      <template v-else>
        <template v-if="filter !== ''">
          {{ $t('snapshots.snapshots_table.no_matching_snapshots') }} <i>{{ filter }}</i>.
        </template>
        <template v-else>
          {{ $t('snapshots.snapshots_table.no_snapshots', { repository }) }}
        </template>
      </template>
    </template>
  </v-data-table>
</template>

<script>
  import { DEFAULT_ITEMS_PER_PAGE } from '@/consts'
  import { vuexAccessors } from '@/helpers/store'
  import { computed } from '@vue/composition-api'
  import Snapshot from '@/components/Snapshots/Snapshot'
  import { filterItems } from '@/helpers/filters'
  import i18n from '@/i18n'

  export default {
    name: 'snapshots-table',
    components: {
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
      filter: {
        type: String,
        default: ''
      },
      repository: {
        type: String,
        default: ''
      }
    },
    setup (props, context) {
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
        return filterItems(props.snapshots, props.filter, ['id'])
      })

      const emitReloadData = () => {
        context.emit('reloadData')
      }

      return {
        pagination,
        items,
        emitReloadData,
        DEFAULT_ITEMS_PER_PAGE,
        HEADERS
      }
    }
  }
</script>
