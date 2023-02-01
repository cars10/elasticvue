<template>
  <div>
    <div v-if="loading">
      <v-progress-linear indeterminate/>
    </div>
    <v-data-iterator v-else
                     :items="items"
                     :options.sync="pagination">
      <template v-slot:default="props">
        <v-row>
          <v-col v-for="item in props.items" :key="item.name" slot="item" cols="12" lg="4" md="6" sm="12">
            <v-card>
              <v-card-title>
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

              <v-row class="ma-0 overflow-x--auto text-caption">
                <v-col :class="nodeListClass" class="pa-0" cols="12" sm="6">
                  <v-list class="py-0" dense>
                    <v-list-item>
                      <v-list-item-action>{{ $t('nodes.node_properties.ip') }}</v-list-item-action>
                      <v-list-item-content class="d-inline-block text-right">
                        {{ item.ip }}
                      </v-list-item-content>
                    </v-list-item>

                    <v-list-item>
                      <v-list-item-content>{{ $t('nodes.node_properties.master') }}</v-list-item-content>
                      <v-list-item-content class="d-inline-block text-right">
                        <template v-if="item.master">yes</template>
                        <template v-else-if="item.masterEligible">eligible</template>
                        <template v-else>no</template>
                      </v-list-item-content>
                    </v-list-item>

                    <v-list-item>
                      <v-list-item-content>{{ $t('nodes.node_properties.node_role') }}</v-list-item-content>
                      <v-list-item-content class="d-inline-block text-right" :title="nodeRoleTitle(item.nodeRole)">
                        {{ item.nodeRole }}
                      </v-list-item-content>
                    </v-list-item>

                    <v-list-item>
                      <v-list-item-content>{{ $t('nodes.node_properties.load') }}</v-list-item-content>
                      <v-list-item-content class="d-inline-block text-right">
                        {{ item.load_1m }} / {{ item.load_5m }} / {{ item.load_15m }}
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-col>

                <v-col class="pa-0" cols="12" sm="6">
                  <v-list class="py-0" dense>
                    <v-list-item>
                      <v-list-item-action class="my-0">{{ $t('nodes.node_properties.cpu') }}</v-list-item-action>
                      <v-list-item-content>
                        <node-percent-bar :value="item.cpu" class="my-0" height="4"/>
                      </v-list-item-content>
                      <v-list-item-action class="my-0">
                        {{ item.cpu }}%
                      </v-list-item-action>
                    </v-list-item>

                    <v-list-item>
                      <v-list-item-action class="my-0">{{ $t('nodes.node_properties.ram') }}</v-list-item-action>
                      <v-list-item-content>
                        {{ item.ramCurrent }}/ {{ item.ramMax }}
                        <node-percent-bar :value="item.ramPercent"/>
                      </v-list-item-content>
                      <v-list-item-action class="my-0">
                        {{ item.ramPercent }}%
                      </v-list-item-action>
                    </v-list-item>

                    <v-list-item>
                      <v-list-item-action class="my-0">{{ $t('nodes.node_properties.heap') }}</v-list-item-action>
                      <v-list-item-content>
                        {{ item.heapCurrent }}/ {{ item.heapMax }}
                        <node-percent-bar :value="item.heapPercent"/>
                      </v-list-item-content>
                      <v-list-item-action class="my-0">
                        {{ item.heapPercent }}%
                      </v-list-item-action>
                    </v-list-item>

                    <v-list-item>
                      <v-list-item-action class="my-0">{{ $t('nodes.node_properties.disk') }}</v-list-item-action>
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
      <template v-slot:no-data>
        <template v-if="filter">
          {{ $t('shared.nothing_found_for_filter', { filter }) }}
        </template>
        <template v-else>
          {{ $t('shared.nothing_found') }}
        </template>
      </template>
    </v-data-iterator>
  </div>
</template>

<script>
  import NodeIcons from '@/components/Nodes/NodeIcons'
  import NodePercentBar from '@/components/Nodes/NodePercentBar'
  import { vuexAccessors } from '@/helpers/store'
  import { computed } from 'vue'
  import { nodeRoleTitle } from '@/helpers'
  import { useVuetify } from '@/helpers/composition'

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
    setup () {
      const { filter, pagination } = vuexAccessors('nodes', ['filter', 'pagination'])

      const vuetify = useVuetify()
      const nodeListClass = computed(() => {
        return {
          'border-right-1': !vuetify.breakpoint.xs
        }
      })

      return {
        nodeRoleTitle,
        filter,
        pagination,
        nodeListClass
      }
    }
  }
</script>
