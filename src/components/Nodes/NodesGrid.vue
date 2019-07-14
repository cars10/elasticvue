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
              <v-text-field id="nodes_grid_filter"
                            v-model="filter"
                            append-icon="mdi-magnify"
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
    <v-data-iterator v-else
                     :items="filteredItems"
                     :options.sync="pagination">
      <v-flex slot="item" slot-scope="props" xs12 sm6 md4 lg4>
        <v-card>
          <v-card-title>
            <span class="subtitle-1">{{ props.item.name }}</span>
            <v-flex right class="d-inline-block text-xs-right">
              <node-icons :elasticsearch-node="props.item"/>
            </v-flex>
          </v-card-title>
          <v-divider/>

          <v-layout row wrap class="ma-0 overflow-x--auto caption">
            <v-flex :class="nodeListClass" xs12 sm6 d-flex pa-0>
              <v-list dense>
                <v-list-item>
                  <v-list-item-content>ip</v-list-item-content>
                  <v-list-item-content class="d-inline-block text-xs-right">
                    {{ props.item.ip }}
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>master</v-list-item-content>
                  <v-list-item-content class="d-inline-block text-xs-right">
                    <template v-if="props.item.master">yes</template>
                    <template v-else-if="props.item.masterEligible">eligible</template>
                    <template v-else>no</template>
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>node.role</v-list-item-content>
                  <v-list-item-content class="d-inline-block text-xs-right">
                    {{ props.item.nodeRole }}
                  </v-list-item-content>
                </v-list-item>

                <v-list-item>
                  <v-list-item-content>load</v-list-item-content>
                  <v-list-item-content class="d-inline-block text-xs-right">
                    {{props.item.load_1m}} / {{props.item.load_5m}} / {{props.item.load_15m}}
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-flex>

            <v-flex xs12 sm6 d-flex pa-0>
              <v-list dense>
                <v-list-item>
                  <v-list-item-action class="my-0">cpu</v-list-item-action>
                  <v-list-item-content>
                    <v-progress-linear :value="props.item.cpu" height="4" class="my-0"/>
                  </v-list-item-content>
                  <v-list-item-action class="my-0">
                    {{ props.item.cpu }}%
                  </v-list-item-action>
                </v-list-item>

                <v-list-item>
                  <v-list-item-action class="my-0">ram</v-list-item-action>
                  <v-list-item-content>
                    {{props.item.ramCurrent}}/ {{props.item.ramMax}}
                    <node-percent-bar :value="props.item.ramPercent"/>
                  </v-list-item-content>
                  <v-list-item-action class="my-0">
                    {{ props.item.ramPercent }}%
                  </v-list-item-action>
                </v-list-item>

                <v-list-item>
                  <v-list-item-action class="my-0">heap</v-list-item-action>
                  <v-list-item-content>
                    {{props.item.heapCurrent}}/ {{props.item.heapMax}}
                    <node-percent-bar :value="props.item.heapPercent"/>
                  </v-list-item-content>
                  <v-list-item-action class="my-0">
                    {{ props.item.heapPercent }}%
                  </v-list-item-action>
                </v-list-item>

                <v-list-item>
                  <v-list-item-action class="my-0">disk</v-list-item-action>
                  <v-list-item-content>
                    {{props.item.diskCurrent}}/ {{props.item.diskMax}}
                    <node-percent-bar :value="props.item.diskPercent"/>
                  </v-list-item-content>
                  <v-list-item-action class="my-0">
                    {{ props.item.diskPercent }}%
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-flex>
          </v-layout>
        </v-card>
      </v-flex>
    </v-data-iterator>
  </div>
</template>

<script>
  import NodeIcons from '@/components/Nodes/NodeIcons'
  import NodePercentBar from '@/components/Nodes/NodePercentBar'
  import ReloadButton from '@/components/shared/ReloadButton'
  import { mapVuexAccessors } from '../../helpers/store'
  import { fuzzyTableFilter } from '../../helpers/filters'

  export default {
    name: 'nodes-grid',
    components: {
      NodeIcons,
      NodePercentBar,
      ReloadButton
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
