<template>
  <content-toggle @changed="emitInput">
    <template slot="first">
      <data-loader ref="indicesLoader" :method="method" render-content-while-loading>
        <template v-slot:default="{body, loading}">
          <index-select v-model="localIndices"
                        :indices="body ? body.map(i => i.index) : []"
                        :loading="loading"
                        @reload="() => $refs.indicesLoader.loadData()"/>
        </template>
      </data-loader>
    </template>
    <template slot="first-activator">
      <a href="javascript:void(0)" class="ml-2">or select indices</a>
    </template>

    <template slot="last">
      <index-pattern v-model="localPattern"/>
    </template>
    <template slot="last-activator">
      <a href="javascript:void(0)" class="ml-2">or use index pattern</a>
    </template>
  </content-toggle>
</template>

<script>
  import IndexSelect from '@/components/shared/IndexSelect'
  import IndexPattern from '@/components/shared/IndexPattern'
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
      }
    }
  }
</script>
