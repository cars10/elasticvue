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
          <td>
            {{props.item.indices}}
            <v-btn v-if="props.item.index_names_loaded" @click="loadIndexNames(props.item)">
              <v-icon>keyboard_arrow_up</v-icon>
              Hide
            </v-btn>
            <v-btn v-else @click="loadIndexNames(props.item)">
              <v-icon>keyboard_arrow_down</v-icon>
              Show
            </v-btn>
            <ul v-if="props.item.index_names">
              <li v-for="name in props.item.index_names" :key="name">{{name}}</li>
            </ul>
          </td>
          <td>{{props.item.successful_shards}}</td>
          <td>{{props.item.failed_shards}}</td>
          <td>{{props.item.total_shards}}</td>
          <td>
            <btn-group small>
              <v-menu offset-y left>
                <v-btn slot="activator" title="Options">
                  <v-icon>settings</v-icon>
                  <v-icon small>arrow_drop_down</v-icon>
                </v-btn>
                <v-list>
                  <list-tile-link :method-params="{repository, snapshot: props.item.id}" :callback="emitReloadData"
                                  :growl="`The snapshot '${props.item.id}' was successfully deleted.`"
                                  :confirm-message="`Delete snapshot '${props.item.id}'?`"
                                  method="snapshotDelete" icon="delete" link-title="Delete snapshot"/>
                </v-list>
              </v-menu>
            </btn-group>
          </td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script>
  import { DEFAULT_ROWS_PER_PAGE } from '@/consts'
  import { fuzzyTableFilter } from '@/helpers/filters'
  import NewSnapshot from '@/components/Snapshots/NewSnapshot'
  import ListTileLink from '@/components/shared/ListTile/ListTileLink'
  import BtnGroup from '@/components/shared/BtnGroup'

  export default {
    name: 'SnapshotsTable',
    components: {
      NewSnapshot,
      ListTileLink,
      BtnGroup
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
        { text: 'total_shards', value: 'total_shards' },
        { text: '', value: 'actions', sortable: false }
      ]
      this.DEFAULT_ROWS_PER_PAGE = DEFAULT_ROWS_PER_PAGE
    },
    methods: {
      callFuzzyTableFilter (items, search, filter, headers) {
        return fuzzyTableFilter(items, search, headers)
      },
      emitReloadData () {
        this.$emit('reloadData')
      },
      loadIndexNames (item) {
        if (item.index_names_loaded) {
          this.$set(item, 'index_names_loaded', false)
          this.$set(item, 'index_names', [])
        } else {
          this.elasticsearchRequest({
            method: 'getSnapshot',
            methodParams: { repository: this.repository, snapshot: item.id },
            callback: body => {
              this.$set(item, 'index_names_loaded', true)
              this.$set(item, 'index_names', body.snapshots[0].indices)
            }
          })
        }
      }
    }
  }
</script>
