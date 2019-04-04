<template>
  <custom-v-autocomplete v-model="localValue"
                         :items="indices | sort"
                         :loading="loading"
                         :chips="chips"
                         prepend-inner-icon="cached"
                         append-icon="arrow_drop_down"
                         multiple
                         label="Select indices"
                         name="indices"
                         @click:prepend-inner="resetSelection">
    <template v-slot:item="data">
      <v-list-tile-action>
        <v-checkbox :input-value="localValue.includes(data.item)" color="primary"/>
      </v-list-tile-action>
      <v-list-tile-content>
        {{data.item}}
      </v-list-tile-content>
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
  </custom-v-autocomplete>
</template>

<script>
  import CustomVAutocomplete from '@/components/shared/CustomVAutocomplete'

  export default {
    name: 'index-select',
    components: {
      CustomVAutocomplete
    },
    filters: {
      sort (data) {
        return data.slice(0).sort()
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
      }
    }
  }
</script>
