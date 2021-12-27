<template>
  <div>
    <v-card-text>
      <v-row>
        <v-col>
          <div v-if="currentReroutingShard.shard">
            <div>
              relocating shard <strong>{{ currentReroutingShard.prirep }}{{ currentReroutingShard.shard }}</strong>
              {{ currentReroutingShard.index }} | {{ currentReroutingShard.node }}
            </div>
            <v-btn small @click="currentReroutingShard = {}">
              <v-icon>mdi-close</v-icon>
              Cancel
            </v-btn>
          </div>
        </v-col>
        <v-col>
          <div class="d-inline-block float-right">
            <v-checkbox v-model="showHiddenIndices"
                        :label="$t('indices.indices_table.show_hidden_indices.label')"
                        class="d-inline-block mr-6 vertical-align--bottom"
                        hide-details/>
            <v-text-field id="filter"
                          v-model="filter"
                          :label="$t('defaults.filter.label')"
                          append-icon="mdi-magnify"
                          autofocus
                          class="mt-0 pt-0 v-text-field--small"
                          hide-details
                          name="filter"
                          @keyup.esc="filter = ''"/>
          </div>
        </v-col>
      </v-row>
    </v-card-text>

    <v-divider></v-divider>

    <v-data-iterator :items="filteredShards.indexNames"
                     :footer-props="{itemsPerPageOptions: DEFAULT_ITEMS_PER_PAGE, showFirstLastPage: true}">

      <template v-slot:default="{items}">
        <v-simple-table class="table--condensed table--bordered" style="color:#fff">
          <thead>
          <tr>
            <th></th>
            <th v-for="(index, i) of items"
                :key="index"
                @mouseover="markColumn(i)"
                @mouseleave="unmarkColumn"
                :class="{marked: markedColumnIndex === i}">
              <div>
                <template v-if="currentReroutingShard.index === index">
                  <span class="red--text">{{ index }}</span>
                </template>
                <template v-else>
                  {{ index }}
                </template>
                <svg height="14" width="14">
                  <circle :class="`health--${filteredShards.indices[index].health}`" cx="7" cy="9" r="5"/>
                </svg>
              </div>
              <div>
                <small class="font-weight-regular">
                  {{ shards.indices[index].pri }}/{{ shards.indices[index].rep }} shards
                </small>
              </div>
            </th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>unassigned</td>
            <td v-for="(index, i) of items" :key="`unassigned_${index}`"
                @mouseover="markColumn(i)"
                @mouseleave="unmarkColumn"
                :class="{marked: markedColumnIndex === i}">

              <div v-if="filteredShards.unassignedShards && filteredShards.unassignedShards[index]"
                   style="white-space:normal">
                <div v-for="(shard, i) of filteredShards.unassignedShards[index]"
                     :key="`unassigned_${index}_${shard.shard}_${i}`"
                     class="ma-1 d-inline-block"
                     :title="stringifyJsonBigInt(shard, null, ' ')">
                  <shard :shard="shard" :action="initReroute"/>
                </div>
              </div>
            </td>
          </tr>
          <tr v-for="node of filteredShards.nodes" :key="node">
            <td>{{ node }}</td>
            <td v-for="(index, i) of items" :key="`${node}_${index}`"
                @mouseover="markColumn(i)"
                @mouseleave="unmarkColumn"
                style="position:relative"
                :class="{marked: markedColumnIndex === i}">

              <div v-if="filteredShards.shards[node] && filteredShards.shards[node][index]" style="white-space:normal">
                <div v-for="(shard, i) of filteredShards.shards[node][index]"
                     :key="`${node}_${index}_${shard.shard}_${i}`"
                     class="ma-1 d-inline-block"
                     :title="stringifyJsonBigInt(shard, null, ' ')">
                  <shard :shard="shard" :action="initReroute"/>
                </div>
              </div>

              <div v-if="currentReroutingShard.index === index && currentReroutingShard.node !== node">
                <button @click="reroute(currentReroutingShard, node)" class="add-here">
                  +
                </button>
              </div>
            </td>
          </tr>
          </tbody>
        </v-simple-table>
        <v-divider></v-divider>
      </template>
    </v-data-iterator>
  </div>
</template>

<style>
.add-here {
  position: absolute;
  /*background-color: grey;*/
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 3px dashed lightgrey;
}
</style>

<script>
  import { computed, ref } from '@vue/composition-api'
  import { stringifyJsonBigInt } from '@/helpers/json_parse'
  import { vuexAccessors } from '@/helpers/store'
  import { DEFAULT_ITEMS_PER_PAGE } from '@/consts'
  import { useElasticsearchRequest } from '@/mixins/RequestComposition'
  import Shard from '@/components/Shards/Shard'

  export default {
    name: 'shards-table',
    components: {
      Shard
    },
    props: {
      shards: {
        type: Object,
        default: () => ({})
      }
    },
    setup (props, context) {
      const markedColumnIndex = ref(null)
      const markColumn = i => {
        if (markedColumnIndex.value !== i) markedColumnIndex.value = i
      }
      const unmarkColumn = () => (markedColumnIndex.value = null)
      const {
        filter,
        showHiddenIndices,
        onlyUnhealthy
      } = vuexAccessors('indices', ['filter', 'showHiddenIndices', 'onlyUnhealthy'])
      const { hideIndicesRegex } = vuexAccessors('indices', ['hideIndicesRegex'])

      const filteredShards = computed(() => {
        const shards = Object.assign({}, props.shards)
        if (Object.keys(shards).length === 0) return shards

        if (!showHiddenIndices.value) {
          Object.assign(shards, { indexNames: shards.indexNames.filter(item => !item.match(new RegExp(hideIndicesRegex.value))) })
        }

        return shards
      })

      const { callElasticsearch } = useElasticsearchRequest()
      const reroute = (shardToReroute, targetNode) => {
        const commands = [
          {
            move: {
              index: shardToReroute.index,
              shard: shardToReroute.shard,
              from_node: shardToReroute.node,
              to_node: targetNode
            }
          }]

        callElasticsearch('clusterReroute', commands).then(() => {
          currentReroutingShard.value = {}
          context.emit('reload')
        })
      }

      const currentReroutingShard = ref({})
      const initReroute = shard => {
        if (currentReroutingShard.value.node === shard.node &&
          currentReroutingShard.value.index === shard.index &&
          currentReroutingShard.value.shard === shard.shard) {
          currentReroutingShard.value = {}
        } else {
          currentReroutingShard.value = shard
        }
      }

      return {
        stringifyJsonBigInt,
        markColumn,
        unmarkColumn,
        markedColumnIndex,
        filter,
        showHiddenIndices,
        onlyUnhealthy,
        filteredShards,
        DEFAULT_ITEMS_PER_PAGE,
        reroute,
        initReroute,
        currentReroutingShard
      }
    }
  }
</script>
