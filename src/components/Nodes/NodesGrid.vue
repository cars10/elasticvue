<template>
  <v-data-iterator :items="items"
                   :pagination.sync="pagination"
                   content-tag="v-layout"
                   row
                   wrap>
    <v-flex slot="item" slot-scope="props" xs12 sm6 md4 lg4 xl3>
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
            </v-list>
          </v-flex>

          <v-flex xs12 sm6 d-flex>
            <v-list dense>
              <v-list-tile>
                <v-list-tile-content>ram</v-list-tile-content>
                <v-list-tile-content class="align-end">
                  {{ props.item.ramPercent }}%
                  <v-progress-linear :value="props.item.ramPercent" height="3" class="my-0"/>
                </v-list-tile-content>
              </v-list-tile>

              <v-list-tile>
                <v-list-tile-content>heap</v-list-tile-content>
                <v-list-tile-content class="align-end">
                  {{ props.item.heapPercent }}%
                  <v-progress-linear :value="props.item.heapPercent" height="3" class="my-0"/>
                </v-list-tile-content>
              </v-list-tile>

              <v-list-tile>
                <v-list-tile-content>cpu</v-list-tile-content>
                <v-list-tile-content class="align-end">
                  {{ props.item.cpu }}%
                  <v-progress-linear :value="props.item.cpu" height="3" class="my-0"/>
                </v-list-tile-content>
              </v-list-tile>

              <v-list-tile>
                <v-list-tile-content>load</v-list-tile-content>
                <v-list-tile-content class="align-end">
                  {{props.item.load_1m}} / {{props.item.load_5m}} / {{props.item.load_15m}}
                </v-list-tile-content>
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

  export default {
    name: 'nodes-grid',
    components: {
      NodeIcons
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
