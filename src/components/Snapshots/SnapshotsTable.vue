<template>
  <div class="font--normal lowered pa-2">
    <div class="px-2">
      <h3 class="subheading py-2">Snapshots for '{{repository}}'</h3>
      <div class="clearfix">
        <new-snapshot :repository="repository" @reloadData="emitReloadData"/>
        <reload-button :action="emitReloadData"/>
        <v-flex right d-inline-flex>
          <v-text-field id="filter"
                        v-model="filter"
                        append-icon="search"
                        label="Filter..."
                        name="filter"
                        class="mt-0"
                        title="Filter via 'column:query'"
                        autofocus
                        hide-details
                        @keyup.esc="filter = ''"/>
        </v-flex>
      </div>
    </div>

    <v-data-table :rows-per-page-items="DEFAULT_ROWS_PER_PAGE"
                  :headers="HEADERS"
                  :items="snapshots"
                  :custom-filter="callFuzzyTableFilter"
                  :search="filter"
                  :loading="loading"
                  class="table--condensed"
                  item-key="id">
      <template slot="items" slot-scope="props">
        <tr>
          <td>{{props.item.id}}</td>
          <td>{{props.item.status}}</td>
          <td>{{props.item.start_time}} ({{props.item.start_epoch}})</td>
          <td>{{props.item.end_time}} ({{props.item.end_epoch}})</td>
          <td>{{props.item.duration}}</td>
          <td>{{props.item.indices}}</td>
          <td>{{props.item.successful_shards}}</td>
          <td>{{props.item.failed_shards}}</td>
          <td>{{props.item.total_shards}}</td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script>
  import { DEFAULT_ROWS_PER_PAGE } from '@/consts'
  import { fuzzyTableFilter } from '@/helpers/filters'
  import NewSnapshot from '@/components/Snapshots/NewSnapshot'

  export default {
    name: 'SnapshotsTable',
    components: {
      NewSnapshot
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
        default: false
      },
      repository: {
        type: String,
        default: ''
      }
    },
    data () {
      return {
        filter: ''
      }
    },
    created () {
      this.HEADERS = [
        { text: 'id', value: 'id' },
        { text: 'status', value: 'status' },
        { text: 'start_time', value: 'start_time' },
        { text: 'end_time', value: 'end_time' },
        { text: 'duration', value: 'duration' },
        { text: 'indices', value: 'indices' },
        { text: 'successful_shards', value: 'successful_shards' },
        { text: 'failed_shards', value: 'failed_shards' },
        { text: 'total_shards', value: 'total_shards' }
      ]
      this.DEFAULT_ROWS_PER_PAGE = DEFAULT_ROWS_PER_PAGE
    },
    methods: {
      callFuzzyTableFilter (items, search, filter, headers) {
        return fuzzyTableFilter(items, search, headers)
      },
      emitReloadData () {
        this.$emit('reloadData')
      }
    }
  }
</script>
