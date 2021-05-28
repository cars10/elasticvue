<template>
  <v-data-table :footer-props="{itemsPerPageOptions: DEFAULT_ITEMS_PER_PAGE}"
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
        Please select a repository first.
      </template>

      <template v-else>
        <template v-if="filter !== ''">
          No snapshots found that match your filter <i>{{ filter }}</i>.
        </template>
        <template v-else>The repository <i>{{ repository }}</i> does not contain any snapshots.</template>
      </template>
    </template>
  </v-data-table>
</template>

<script>
  import { DEFAULT_ITEMS_PER_PAGE } from '@/consts'
  import { compositionVuexAccessors } from '@/helpers/store'
  import { computed } from '@vue/composition-api'
  import Snapshot from '@/components/Snapshots/Snapshot'
  import { filterItems } from '@/helpers/filters'

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
      const { pagination } = compositionVuexAccessors('snapshots', ['pagination'])
      const HEADERS = [
        { text: 'id', value: 'id' },
        { text: 'status', value: 'status' },
        { text: 'start_time', value: 'start_time' },
        { text: 'end_time', value: 'end_time' },
        { text: 'duration', value: 'duration' },
        { text: 'indices', value: 'indices' },
        { text: 'successful_shards', value: 'successful_shards' },
        { text: 'failed_shards', value: 'failed_shards' },
        { text: 'total_shards', value: 'total_shards' },
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
