<template>
  <v-autocomplete v-model="localValue"
                  :items="filteredIndices"
                  :label="$t('shared.index_filter.index_select.select_indices.label')"
                  :loading="loading"
                  append-icon="mdi-menu-down"
                  autocomplete="off"
                  multiple
                  name="indices"
                  prepend-inner-icon="mdi-cached"
                  @click:prepend-inner="resetSelection">
    <template v-slot:item="data">
      <v-list-item-action>
        <v-checkbox :input-value="localValue.includes(data.item)" color="primary-button"/>
      </v-list-item-action>
      <v-list-item-content :title="data.item" class="text-truncate">
        {{ data.item }}
      </v-list-item-content>
    </template>

    <template v-slot:selection="{ item, index }">
      <template v-if="index === 0">
        <template v-if="localValue.length === 1">
          {{ item }}
        </template>
        <template v-else>
          {{ localValue.length }} {{ $t('shared.index_filter.index_select.indices_selected') }}
        </template>
      </template>
    </template>

    <template v-slot:prepend-item>
      <div class="px-4 mb-2">
        <btn-group class="d-inline-block">
          <v-btn :title="$t('shared.index_filter.index_select.select_all.title')" small @click="selectAll">
            {{ $t('shared.index_filter.index_select.select_all.text') }}
          </v-btn>

          <v-btn :title="$t('shared.index_filter.index_select.deselect_all.title')" small @click="deselectAll">
            {{ $t('shared.index_filter.index_select.deselect_all.text') }}
          </v-btn>
        </btn-group>

        <div class="float-right d-inline-block">
          <v-checkbox v-model="showHidden"
                      :label="$t('shared.index_filter.index_select.show_hidden.label')"
                      :title="$t('shared.index_filter.index_select.show_hidden.title')"
                      class="mt-0"
                      color="primary-button"
                      hide-details/>
        </div>
      </div>
      <v-divider/>
    </template>
  </v-autocomplete>
</template>

<script>
  import BtnGroup from '@/components/shared/BtnGroup'
  import { computed, ref } from 'vue'
  import { vuexAccessors } from '@/helpers/store'

  export default {
    name: 'index-select',
    components: {
      BtnGroup
    },
    props: {
      value: {
        type: Array,
        default: () => ([])
      },
      indices: {
        type: Array,
        default: () => ([])
      },
      loading: {
        type: Boolean,
        default: false
      }
    },
    setup (props, context) {
      const { hideIndicesRegex } = vuexAccessors('indices', ['hideIndicesRegex'])
      const showHidden = ref(false)
      const localValue = computed({
        get () {
          return props.value
        },
        set (value) {
          context.emit('input', value)
        }
      })

      const filteredIndices = computed(() => {
        if (showHidden.value) {
          return props.indices.slice(0).sort()
        } else {
          return props.indices.slice(0).filter(index => !index[0].match(new RegExp(hideIndicesRegex.value))).sort()
        }
      })

      const resetSelection = () => {
        localValue.value = []
        context.emit('reload')
      }

      const selectAll = () => {
        if (showHidden.value) {
          localValue.value = props.indices
        } else {
          localValue.value = props.indices.filter(index => index[0] !== '.')
        }
      }

      const deselectAll = () => {
        localValue.value = []
      }

      const toggleHidden = () => {
        showHidden.value = !showHidden.value
      }

      return {
        showHidden,
        localValue,
        resetSelection,
        selectAll,
        deselectAll,
        toggleHidden,
        filteredIndices
      }
    }
  }
</script>
