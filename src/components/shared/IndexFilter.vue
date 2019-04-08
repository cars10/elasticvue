<template>
  <content-toggle @changed="emitInput">
    <template slot="first">
      <index-pattern v-model="localPattern"/>
    </template>
    <template slot="first-activator">
      <a href="javascript:void(0)" class="ml-2">or use index pattern</a>
    </template>

    <template slot="last">
      <data-loader ref="indicesLoader" :method="method" :method-params="methodParams" render-content-while-loading>
        <template v-slot:default="{body, loading}">
          <index-select v-model="localIndices"
                        :indices="getIndexNames(body)"
                        :loading="loading"
                        @reload="() => $refs.indicesLoader.loadData()"/>
        </template>
      </data-loader>
    </template>
    <template slot="last-activator">
      <a href="javascript:void(0)" class="ml-2">or select indices</a>
    </template>
  </content-toggle>
</template>

<script>
  import IndexSelect from '@/components/shared/IndexFilter/IndexSelect'
  import IndexPattern from '@/components/shared/IndexFilter/IndexPattern'
  import DataLoader from '@/components/shared/DataLoader'
  import ContentToggle from '@/components/shared/ContentToggle'

  export default {
    name: 'index-filter',
    components: {
      ContentToggle,
      DataLoader,
      IndexSelect,
      IndexPattern
    },
    props: {
      method: {
        type: String,
        default: ''
      },
      methodParams: {
        type: Object,
        default: () => ({})
      },
      value: {
        type: [String, Array],
        default: () => ([])
      }
    },
    data () {
      return {
        localIndices: Array.isArray(this.value) ? this.value : [],
        localPattern: typeof this.value === 'string' ? this.value : ''
      }
    },
    watch: {
      localIndices (newValue) {
        this.$emit('input', newValue)
      },
      localPattern (newValue) {
        this.$emit('input', newValue)
      }
    },
    methods: {
      emitInput (firstActive) {
        if (firstActive) {
          this.$emit('input', this.localIndices)
        } else {
          this.$emit('input', this.localPattern)
        }
      },
      getIndexNames (indices) {
        if (!indices) return []
        if (typeof indices[0] === 'string') {
          return indices
        } else {
          return indices.map(i => i.index)
        }
      }
    }
  }
</script>
