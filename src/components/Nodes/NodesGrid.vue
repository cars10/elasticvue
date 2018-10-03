<template>
  <v-data-iterator :items="items"
                   :pagination.sync="pagination"
                   content-tag="v-layout"
                   row
                   wrap>
    <v-flex slot="item" slot-scope="props" xs12 sm6 md4 lg4>
      <v-card>
        <v-card-title>
          <h3>{{ props.item.name }}</h3>
          <v-flex right class="text-xs-right">
            <node-icons :elasticsearch-node="props.item"/>
          </v-flex>
        </v-card-title>
        <v-divider/>

        <v-layout row wrap>
          <v-flex :class="nodeListClass" xs12 sm6 d-flex>
            <v-list dense>
              <v-list-tile>
                <v-list-tile-content>ip</v-list-tile-content>
                <v-list-tile-content class="align-end">{{ props.item.ip }}</v-list-tile-content>
              </v-list-tile>

              <v-list-tile>
                <v-list-tile-content>master</v-list-tile-content>
                <v-list-tile-content class="align-end">
                  <span v-if="props.item.master">yes</span>
                  <span v-else-if="props.item.masterEligible">eligible</span>
                  <span v-else>no</span>
                </v-list-tile-content>
              </v-list-tile>

              <v-list-tile>
                <v-list-tile-content>node.role</v-list-tile-content>
                <v-list-tile-content class="align-end">{{ props.item.nodeRole }}</v-list-tile-content>
              </v-list-tile>

              <v-list-tile>
                <v-list-tile-content>load</v-list-tile-content>
                <v-list-tile-content class="align-end">
                  {{props.item.load_1m}} / {{props.item.load_5m}} / {{props.item.load_15m}}
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-flex>

          <v-flex xs12 sm6 d-flex>
            <v-list dense>
              <v-list-tile>
                <v-list-tile-action>cpu</v-list-tile-action>
                <v-list-tile-content>
                  <v-progress-linear :value="props.item.cpu" height="4" class="my-0"/>
                </v-list-tile-content>
                <v-list-tile-action>{{ props.item.cpu }}%</v-list-tile-action>
              </v-list-tile>

              <v-list-tile>
                <v-list-tile-action>ram</v-list-tile-action>
                <v-list-tile-content class="align-en">
                  <small>{{props.item.ramCurrent}}/{{props.item.ramMax}}</small>
                  <node-percent-bar :value="props.item.ramPercent" />
                </v-list-tile-content>
                <v-list-tile-action>{{ props.item.ramPercent }}%</v-list-tile-action>
              </v-list-tile>

              <v-list-tile>
                <v-list-tile-action>heap</v-list-tile-action>
                <v-list-tile-content>
                  <small>{{props.item.heapCurrent}}/{{props.item.heapMax}}</small>
                  <node-percent-bar :value="props.item.heapPercent" />
                </v-list-tile-content>
                <v-list-tile-action>{{ props.item.heapPercent }}%</v-list-tile-action>
              </v-list-tile>

              <v-list-tile>
                <v-list-tile-action>disk</v-list-tile-action>
                <v-list-tile-content>
                  <small>{{props.item.diskCurrent}}/{{props.item.diskMax}}</small>
                  <node-percent-bar :value="props.item.diskPercent" />
                </v-list-tile-content>
                <v-list-tile-action>{{ props.item.diskPercent }}%</v-list-tile-action>
              </v-list-tile>
            </v-list>
          </v-flex>
        </v-layout>
      </v-card>
    </v-flex>
  </v-data-iterator>
</template>

<script>
  import { mapVuexAccessors } from '../../helpers/store'
  import NodeIcons from '@/components/Nodes/NodeIcons'
  import NodePercentBar from '@/components/Nodes/NodePercentBar'

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
      }
    },
    computed: {
      ...mapVuexAccessors('nodes', ['filter', 'pagination']),
      nodeListClass () {
        return {
          'border-right-1': !this.$vuetify.breakpoint.xs
        }
      },
      breakpoint () {
        return this.$vuetify.breakpoint
      }
    }
  }
</script>
