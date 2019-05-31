<template>
  <v-text-field v-model="localValue"
                :hint="matchHint"
                :loading="loading"
                label="Index pattern"
                persistent-hint
                @input="loadMatches"
                @keyup.esc="localValue = '*'"/>
</template>

<script>
  import { elasticsearchRequest } from '@/mixins/ElasticsearchAdapterHelper'

  export default {
    name: 'index-pattern',
    props: {
      value: {
        type: String,
        default: '*'
      }
    },
    data () {
      return {
        indices: [],
        loading: false
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
      },
      matchHint () {
        if (this.loading) {
          return 'loading...'
        } else {
          return `matches <strong title="${this.indexNames}">${this.indices.length} indices</strong>`
        }
      },
      indexNames () {
        const MAX_INDEX_NAMES = 20
        if (this.indices.length > MAX_INDEX_NAMES) {
          return this.indices.slice(0, MAX_INDEX_NAMES).map(i => i.index).sort().join('\n') + '\n...'
        } else {
          return this.indices.map(i => i.index).sort().join('\n')
        }
      }
    },
    created () {
      this.loadMatches(this.localValue)
    },
    methods: {
      loadMatches (newValue) {
        this.loading = true
        elasticsearchRequest({
          method: 'catIndices',
          methodParams: { index: newValue, h: 'index' },
          silenceError: true
        }).then(body => {
          if (newValue === this.localValue) {
            this.indices = body || []
            this.loading = false
          }
        })
      }
    }
  }
</script>
