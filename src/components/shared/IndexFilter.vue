<template>
  <content-toggle :first-slot-active="typeof value === 'string'" @changed="emitInput">
    <template slot="first">
      <index-pattern v-model="localPattern"/>
    </template>
    <template slot="first-activator">
      <a class="ml-2" href="javascript:void(0)">use index pattern</a>
    </template>

    <template slot="last">
      <index-select v-model="localIndices" :indices="indexNames" :loading="requestState.loading" @reload="load"/>
    </template>
    <template slot="last-activator">
      <a class="ml-2" href="javascript:void(0)">select indices</a>
    </template>
  </content-toggle>
</template>

<script>
  import IndexSelect from '@/components/shared/IndexFilter/IndexSelect'
  import IndexPattern from '@/components/shared/IndexFilter/IndexPattern'
  import ContentToggle from '@/components/shared/ContentToggle'
  import { computed, onMounted, ref, watch } from '@vue/composition-api'
  import { setupElasticsearchRequest } from '@/mixins/RequestComposition'

  export default {
    name: 'index-filter',
    components: {
      ContentToggle,
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
    setup (props, context) {
      const localIndices = Array.isArray(props.value) ? ref(props.value) : ref([])
      const localPattern = typeof props.value === 'string' ? ref(props.value) : ref('')

      const { load, requestState, data } = setupElasticsearchRequest(props.method, props.methodParams)
      onMounted(load)

      const emitInput = firstActive => {
        if (firstActive) {
          context.emit('input', localPattern.value)
        } else {
          context.emit('input', localIndices.value)
        }
      }

      const indexNames = computed(() => {
        if (!data.value) return []
        if (typeof data.value[0] === 'string') {
          return data.value
        } else {
          return data.value.map(i => i.index)
        }
      })

      watch(localIndices, newValue => {
        context.emit('input', newValue)
      })

      watch(localPattern, newValue => {
        context.emit('input', newValue)
      })

      return {
        localIndices,
        localPattern,
        emitInput,
        indexNames,
        load,
        requestState,
        data
      }
    }
  }
</script>
