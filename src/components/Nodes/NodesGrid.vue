<template>
  <div>
    <v-card class="mb-2">
      <v-card-title class="clearfix">
        <v-layout row wrap>
          <v-flex xs12 sm6 py-0 pl-0>
            <h2 class="headline d-inline-flex vertical-align--middle">Nodes</h2>
            <reload-button id="reload-nodes" :action="() => this.$emit('reloadNodes')"/>
          </v-flex>
          <v-flex xs12 sm6 py-0>
            <v-flex right d-inline-flex>
              <v-text-field id="filter"
                            v-model="filter"
                            append-icon="search"
                            label="Filter..."
                            name="filter"
                            class="mt-0 pt-0"
                            title="Filter via 'column:query'"
                            autofocus
                            hide-details
                            @keyup.esc="filter = ''"/>
            </v-flex>
          </v-flex>
        </v-layout>
      </v-card-title>
    </v-card>

    <div v-if="loading">
      <v-progress-linear indeterminate/>
    </div>
    <v-data-iterator v-else :items="filteredItems" :pagination.sync="pagination" content-tag="div"
                     content-class="row wrap layout">
      <v-flex slot="item" slot-scope="props" xs12 sm6 md4 lg4>
        <v-card>
          <v-card-title>
            <h3>{{ props.item.name }}</h3>
            <v-flex right class="text-xs-right">
              <node-icons :elasticsearch-node="props.item"/>
            </v-flex>
          </v-card-title>
          <v-divider/>

          <v-layout row wrap class="ma-0 overflow-x--auto">
            <v-flex :class="nodeListClass" xs12 sm6 d-flex pa-0>
              <v-list dense>
                <v-list-tile>
                  <v-list-tile-content>ip</v-list-tile-content>
                  <v-list-tile-content class="align-end">
                    <small>{{ props.item.ip }}</small>
                  </v-list-tile-content>
                </v-list-tile>

                <v-list-tile>
                  <v-list-tile-content>master</v-list-tile-content>
                  <v-list-tile-content class="align-end">
                    <small v-if="props.item.master">yes</small>
                    <small v-else-if="props.item.masterEligible">eligible</small>
                    <small v-else>no</small>
                  </v-list-tile-content>
                </v-list-tile>

                <v-list-tile>
                  <v-list-tile-content>node.role</v-list-tile-content>
                  <v-list-tile-content class="align-end">
                    <small>{{ props.item.nodeRole }}</small>
                  </v-list-tile-content>
                </v-list-tile>

                <v-list-tile>
                  <v-list-tile-content>load</v-list-tile-content>
                  <v-list-tile-content class="align-end">
                    <small>{{props.item.load_1m}} / {{props.item.load_5m}} / {{props.item.load_15m}}</small>
                  </v-list-tile-content>
                </v-list-tile>
              </v-list>
            </v-flex>

            <v-flex xs12 sm6 d-flex pa-0>
              <v-list dense>
                <v-list-tile>
                  <v-list-tile-action>cpu</v-list-tile-action>
                  <v-list-tile-content>
                    <v-progress-linear :value="props.item.cpu" height="4" class="my-0"/>
                  </v-list-tile-content>
                  <v-list-tile-action>
                    <small>{{ props.item.cpu }}%</small>
                  </v-list-tile-action>
                </v-list-tile>

                <v-list-tile>
                  <v-list-tile-action>ram</v-list-tile-action>
                  <v-list-tile-content>
                    <small>{{props.item.ramCurrent}}/ {{props.item.ramMax}}</small>
                    <node-percent-bar :value="props.item.ramPercent"/>
                  </v-list-tile-content>
                  <v-list-tile-action>
                    <small>{{ props.item.ramPercent }}%</small>
                  </v-list-tile-action>
                </v-list-tile>

                <v-list-tile>
                  <v-list-tile-action>heap</v-list-tile-action>
                  <v-list-tile-content>
                    <small>{{props.item.heapCurrent}}/ {{props.item.heapMax}}</small>
                    <node-percent-bar :value="props.item.heapPercent"/>
                  </v-list-tile-content>
                  <v-list-tile-action>
                    <small>{{ props.item.heapPercent }}%</small>
                  </v-list-tile-action>
                </v-list-tile>

                <v-list-tile>
                  <v-list-tile-action>disk</v-list-tile-action>
                  <v-list-tile-content>
                    <small>{{props.item.diskCurrent}}/ {{props.item.diskMax}}</small>
                    <node-percent-bar :value="props.item.diskPercent"/>
                  </v-list-tile-content>
                  <v-list-tile-action>
                    <small>{{ props.item.diskPercent }}%</small>
                  </v-list-tile-action>
                </v-list-tile>
              </v-list>
            </v-flex>
          </v-layout>
        </v-card>
      </v-flex>
    </v-data-iterator>
  </div>
</template>

<script>
  import { mapVuexAccessors } from '../../helpers/store'
  import NodeIcons from '@/components/Nodes/NodeIcons'
  import NodePercentBar from '@/components/Nodes/NodePercentBar'
  import { fuzzyTableFilter } from '../../helpers/filters'

  export default {
    name: 'nodes-grid',
    components: {
      NodeIcons,
      NodePercentBar
    },
    props: {
      items: {
        type: Array,
        default: () => {
          return []
        }
      },
      loading: {
        default: true,
        type: Boolean
      }
    },
    computed: {
      ...mapVuexAccessors('nodes', ['filter', 'pagination']),
      nodeListClass () {
        return {
          'border-right-1': !this.$vuetify.breakpoint.xs
        }
      },
      filteredItems () {
        return fuzzyTableFilter(this.items, this.filter, [{ value: 'name' }, { value: 'ip' }])
      }
    }
  }
</script>
