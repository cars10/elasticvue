<template>
  <div>
    <v-card class="mb-2">
      <v-card-title class="clearfix">
        <v-row>
          <v-col class="py-0" cols="12" sm="6">
            Nodes
            <reload-button id="reload-nodes" :action="() => this.$emit('reloadNodes')"/>
          </v-col>
          <v-col class="py-0" cols="12" sm="6">
            <div class="float-right">
              <v-text-field id="nodes_grid_filter"
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
      </v-card-title>
    </v-card>

    <div v-if="loading">
      <v-progress-linear indeterminate/>
    </div>
    <v-data-iterator v-else
                     :items="filteredItems"
                     :options.sync="pagination">
      <template v-slot:default="props">
        <v-row>
          <v-col v-for="item in props.items" slot="item" :key="item.name" cols="12" lg="4" md="6" sm="12">
            <v-card>
              <v-card-title class="py-0">
                <div class="row">
                  <div class="col">
                    <span class="text-subtitle-1">{{ item.name }}</span>
                  </div>
                  <div class="col">
                    <div class="d-inline-block float-right">
                      <node-icons :elasticsearch-node="item"/>
                    </div>
                  </div>
                </div>
              </v-card-title>
              <v-divider/>

              <v-row class="ma-0 overflow-x--auto caption">
                <v-col :class="nodeListClass" class="pa-0" cols="12" sm="6">
                  <v-list class="py-0" dense>
                    <v-list-item>
                      <v-list-item-action>ip</v-list-item-action>
                      <v-list-item-content class="d-inline-block text-right">
                        {{ item.ip }}
                      </v-list-item-content>
                    </v-list-item>

                    <v-list-item>
                      <v-list-item-content>master</v-list-item-content>
                      <v-list-item-content class="d-inline-block text-right">
                        <template v-if="item.master">yes</template>
                        <template v-else-if="item.masterEligible">eligible</template>
                        <template v-else>no</template>
                      </v-list-item-content>
                    </v-list-item>

                    <v-list-item>
                      <v-list-item-content>node.role</v-list-item-content>
                      <v-list-item-content class="d-inline-block text-right">
                        {{ item.nodeRole }}
                      </v-list-item-content>
                    </v-list-item>

                    <v-list-item>
                      <v-list-item-content>load</v-list-item-content>
                      <v-list-item-content class="d-inline-block text-right">
                        {{ item.load_1m }} / {{ item.load_5m }} / {{ item.load_15m }}
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-col>

                <v-col class="pa-0" cols="12" sm="6">
                  <v-list class="py-0" dense>
                    <v-list-item>
                      <v-list-item-action class="my-0">cpu</v-list-item-action>
                      <v-list-item-content>
                        <node-percent-bar :value="item.cpu" class="my-0" height="4"/>
                      </v-list-item-content>
                      <v-list-item-action class="my-0">
                        {{ item.cpu }}%
                      </v-list-item-action>
                    </v-list-item>

                    <v-list-item>
                      <v-list-item-action class="my-0">ram</v-list-item-action>
                      <v-list-item-content>
                        {{ item.ramCurrent }}/ {{ item.ramMax }}
                        <node-percent-bar :value="item.ramPercent"/>
                      </v-list-item-content>
                      <v-list-item-action class="my-0">
                        {{ item.ramPercent }}%
                      </v-list-item-action>
                    </v-list-item>

                    <v-list-item>
                      <v-list-item-action class="my-0">heap</v-list-item-action>
                      <v-list-item-content>
                        {{ item.heapCurrent }}/ {{ item.heapMax }}
                        <node-percent-bar :value="item.heapPercent"/>
                      </v-list-item-content>
                      <v-list-item-action class="my-0">
                        {{ item.heapPercent }}%
                      </v-list-item-action>
                    </v-list-item>

                    <v-list-item>
                      <v-list-item-action class="my-0">disk</v-list-item-action>
                      <v-list-item-content>
                        {{ item.diskCurrent }}/ {{ item.diskMax }}
                        <node-percent-bar :value="item.diskPercent"/>
                      </v-list-item-content>
                      <v-list-item-action class="my-0">
                        {{ item.diskPercent }}%
                      </v-list-item-action>
                    </v-list-item>
                  </v-list>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </v-data-iterator>
  </div>
</template>

<script>
  import NodeIcons from '@/components/Nodes/NodeIcons'
  import NodePercentBar from '@/components/Nodes/NodePercentBar'
  import ReloadButton from '@/components/shared/ReloadButton'
  import { compositionVuexAccessors } from '@/helpers/store'
  import { fuzzyTableFilter } from '@/helpers/filters'
  import { computed } from '@vue/composition-api'

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
    setup (props, context) {
      const { filter, pagination } = compositionVuexAccessors('nodes', ['filter', 'pagination'])

      const nodeListClass = computed(() => {
        return {
          'border-right-1': !context.root.$vuetify.breakpoint.xs
        }
      })

      const filteredItems = computed(() => {
        return fuzzyTableFilter(props.items, filter.value, [{ value: 'name' }, { value: 'ip' }])
      })

      return {
        filter,
        pagination,
        nodeListClass,
        filteredItems
      }
    }
  }
</script>
