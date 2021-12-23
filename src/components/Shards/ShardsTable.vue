<template>
  <div>
    <v-card-text>
      <v-row>
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
    <v-simple-table v-if="!loading" class="table--condensed table--bordered" style="color:#fff">
      <thead>
      <tr>
        <th></th>
        <th v-for="(index, i) of filteredShards.indexNames"
            :key="index"
            @mouseover="markColumn(i)"
            @mouseleave="unmarkColumn"
            :class="{marked: markedColumnIndex === i}">
          <div>
            {{ index }}
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
      <tr v-for="node of filteredShards.nodes" :key="node">
        <td>
          <i v-if="node === 'unassigned'">{{ node }}</i>
          <template v-else>{{ node }}</template>
        </td>
        <td v-for="(index, i) of filteredShards.indexNames" :key="`${node}_${index}`"
            @mouseover="markColumn(i)"
            @mouseleave="unmarkColumn"
            :class="{marked: markedColumnIndex === i}">
          <div v-if="filteredShards.shards[node] && filteredShards.shards[node][index]">
            <span v-for="(shard, i) of filteredShards.shards[node][index]"
                  :key="`${node}_${index}_${shard.shard}_${i}`"
                  class="ma-1 d-inline-block"
                  :title="stringifyJsonBigInt(shard, null, ' ')">
            <v-chip small label class="px-2" color="success" v-if="shard.prirep==='p'">p{{ shard.shard }}</v-chip>
            <v-chip small label class="px-2" v-else>r{{ shard.shard }}</v-chip>
            </span>
          </div>
        </td>
      </tr>
      </tbody>
    </v-simple-table>
  </div>
</template>

<script>
  import { computed, ref } from '@vue/composition-api'
  import { stringifyJsonBigInt } from '@/helpers/json_parse'
  import { vuexAccessors } from '@/helpers/store'

  export default {
    name: 'shards-table',
    props: {
      shards: {
        type: Object,
        default: () => ({})
      },
      loading: {
        type: Boolean,
        default: true
      }
    },
    setup (props) {
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

      return {
        stringifyJsonBigInt,
        markColumn,
        unmarkColumn,
        markedColumnIndex,
        filter,
        showHiddenIndices,
        onlyUnhealthy,
        filteredShards
      }
    }
  }
</script>
