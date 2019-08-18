<template>
  <div class="font--normal lowered pa-2">
    <div class="px-2">
      <h3 class="subtitle-1 py-2">Snapshots for '{{repository}}'</h3>
      <div class="clearfix">
        <v-row>
          <v-col>
            <new-snapshot :repository="repository" @reloadData="emitReloadData"/>
            <reload-button :action="emitReloadData" title="Reload snapshots"/>
          </v-col>
          <v-col>
            <div class="float-right d-inline-flex">
              <v-text-field id="filter"
                            v-model="filter"
                            append-icon="mdi-magnify"
                            autofocus
                            class="mt-0 pt-0 v-text-field--small"
                            hide-details
                            label="Filter..."
                            name="filter"
                            title="Filter via 'column:query'"
                            @keyup.esc="filter = ''"/>
            </div>
          </v-col>
        </v-row>
      </div>
    </div>

    <v-data-table :footer-props="{itemsPerPageOptions: DEFAULT_ITEMS_PER_PAGE}"
                  :headers="HEADERS"
                  :items="filteredSnapshots"
                  :loading="loading"
                  class="table--condensed"
                  item-key="id">
      <template v-slot:item="props">
        <tr>
          <td>{{props.item.id}}</td>
          <td>{{props.item.status}}</td>
          <td>{{props.item.start_time}} ({{props.item.start_epoch}})</td>
          <td>{{props.item.end_time}} ({{props.item.end_epoch}})</td>
          <td>{{props.item.duration}}</td>
          <td>
            {{props.item.indices}}
            <v-btn v-if="props.item.index_names_loaded" text @click="loadIndexNames(props.item)">
              <v-icon>mdi-chevron-up</v-icon>
              Hide
            </v-btn>
            <v-btn v-else text @click="loadIndexNames(props.item)">
              <v-icon>mdi-chevron-down</v-icon>
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
              <v-menu left offset-y>
                <template v-slot:activator="{on}">
                  <v-btn title="Options" v-on="on">
                    <v-icon>mdi-settings</v-icon>
                    <v-icon small>mdi-menu-down</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <restore-snapshot :repository="repository" :snapshot="props.item.id"/>

                  <list-tile-link :callback="emitReloadData" :confirm-message="`Delete snapshot '${props.item.id}'?`"
                                  :growl="`The snapshot '${props.item.id}' was successfully deleted.`"
                                  :method-params="{repository, snapshot: props.item.id}"
                                  icon="mdi-delete" link-title="Delete snapshot" method="snapshotDelete"/>
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
  import BtnGroup from '@/components/shared/BtnGroup'
  import DataLoader from '@/components/shared/DataLoader'
  import ListTileLink from '@/components/shared/ListTile/ListTileLink'
  import NewSnapshot from '@/components/Snapshots/NewSnapshot'
  import ReloadButton from '@/components/shared/ReloadButton'
  import RestoreSnapshot from '@/components/Snapshots/RestoreSnapshot'
  import { DEFAULT_ITEMS_PER_PAGE } from '@/consts'
  import { fuzzyTableFilter } from '@/helpers/filters'
  import { elasticsearchRequest } from '@/mixins/ElasticsearchAdapterHelper'

  export default {
    name: 'snapshots-table',
    components: {
      BtnGroup,
      DataLoader,
      ListTileLink,
      NewSnapshot,
      ReloadButton,
      RestoreSnapshot
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
    computed: {
      filteredSnapshots () {
        return fuzzyTableFilter(this.snapshots, this.filter, this.HEADERS)
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
      this.DEFAULT_ITEMS_PER_PAGE = DEFAULT_ITEMS_PER_PAGE
    },
    methods: {
      emitReloadData () {
        this.$emit('reloadData')
      },
      loadIndexNames (item) {
        if (item.index_names_loaded) {
          this.$set(item, 'index_names_loaded', false)
          this.$set(item, 'index_names', [])
        } else {
          elasticsearchRequest({
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
