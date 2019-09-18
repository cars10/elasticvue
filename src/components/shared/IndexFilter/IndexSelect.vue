<template>
  <custom-v-autocomplete :chips="chips"
                         :items="indices | filteredIndices(showHidden)"
                         :loading="loading"
                         v-model="localValue"
                         append-icon="mdi-menu-down"
                         label="Select indices"
                         multiple
                         name="indices"
                         prepend-inner-icon="mdi-cached"
                         @click:prepend-inner="resetSelection">
    <template v-slot:item="data">
      <v-list-item-action>
        <v-checkbox :input-value="localValue.includes(data.item)" color="primary"/>
      </v-list-item-action>
      <v-list-item-content>
        {{data.item}}
      </v-list-item-content>
    </template>

    <template v-slot:selection="{ item, index }">
      <template v-if="chips">
        <v-chip v-if="index < showMaxEntries">
          <span>{{ item }}</span>
        </v-chip>
        <span v-if="index === showMaxEntries" class="grey--text caption">(+{{ localValue.length - showMaxEntries }} others)</span>
      </template>

      <template v-else>
        <small v-if="index < showMaxEntries">
          {{ item }}<span v-if="index + 1 < localValue.length">,&nbsp;</span>
        </small>
        <span v-if="index === showMaxEntries" class="grey--text caption">(+{{ localValue.length - showMaxEntries }} others)</span>
      </template>
    </template>

    <template v-slot:prepend-item>
      <div class="px-4 mb-2">
        <btn-group class="d-inline-block">
          <v-btn small title="Select all indices" @click="selectAll">
            select all
          </v-btn>

          <v-btn small title="Deselect all indices" @click="deselectAll">
            deselect all
          </v-btn>
        </btn-group>

        <div class="float-right d-inline-block">
          <v-checkbox v-model="showHidden" class="mt-0" hide-details label="show hidden" color="primary"
                      title="Show indices starting with a dot"/>
        </div>
      </div>
      <v-divider/>
    </template>
  </custom-v-autocomplete>
</template>

<script>
  import CustomVAutocomplete from '@/components/shared/CustomVAutocomplete'
  import BtnGroup from '@/components/shared/BtnGroup'

  export default {
    name: 'index-select',
    components: {
      BtnGroup,
      CustomVAutocomplete
    },
    filters: {
      filteredIndices (data, showHidden) {
        if (showHidden) {
          return data.slice(0).sort()
        } else {
          return data.slice(0).filter(index => index[0] !== '.').sort()
        }
      }
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
      },
      chips: {
        type: Boolean,
        default: false
      },
      showMaxEntries: {
        type: Number,
        default: 2
      }
    },
    data () {
      return {
        showHidden: true
      }
    },
    computed: {
      localValue: {
        get () {
          return this.value
        },
        set (value) {
          this.$emit('input', value)
        }
      }
    },
    methods: {
      resetSelection () {
        this.localValue = []
        this.$emit('reload')
      },
      selectAll () {
        if (this.showHidden) {
          this.localValue = this.indices
        } else {
          this.localValue = this.indices.filter(index => index[0] !== '.')
        }
      },
      deselectAll () {
        this.localValue = []
      },
      toggleHidden () {
        this.showHidden = !this.showHidden
      }
    }
  }
</script>
