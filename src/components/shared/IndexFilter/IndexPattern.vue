<template>
  <v-text-field id="index-pattern"
                v-model="localValue"
                :hint="requestState.loading ? 'loading...' : matchHint"
                :label="$t('shared.index_filter.index_pattern.input.label')"
                :loading="requestState.loading"
                autocomplete="off"
                persistent-hint
                @input="load"
                @keyup.esc="localValue = '*'">
    <template v-slot:message="{ message }">
      <span v-html="message"/>
    </template>
  </v-text-field>
</template>

<script>
  import i18n from '@/i18n'
  import { computed, onMounted, ref, watch } from 'vue'
  import { useElasticsearchRequest } from '@/mixins/RequestComposition'
  import { debounce } from '@/helpers'

  export default {
    name: 'index-pattern',
    props: {
      value: {
        type: String,
        default: '*'
      }
    },
    setup (props, context) {
      const MAX_INDEX_NAMES = 20
      const indices = ref([])
      const localValue = computed({
        get () {
          return props.value
        },
        set (value) {
          context.emit('input', value)
        }
      })

      const { requestState, callElasticsearch } = useElasticsearchRequest()
      const load = pattern => {
        callElasticsearch('catIndices', { index: pattern, h: 'index' })
          .then(body => {
            if (pattern === localValue.value) indices.value = body
          })
          .catch(() => (indices.value = []))
      }
      const debouncedLoad = debounce(load, 250)

      onMounted(() => {
        debouncedLoad(localValue.value)
      })
      watch(localValue, () => {
        debouncedLoad(localValue.value)
      })

      const matchHint = computed(() => {
        let indexNames
        if (indices.value.length > MAX_INDEX_NAMES) {
          indexNames = indices.value.slice(0, MAX_INDEX_NAMES).map(i => i.index).sort().join('\n') + '\n...'
        } else {
          indexNames = indices.value.map(i => i.index).sort().join('\n')
        }
        return i18n.t('shared.index_filter.index_pattern.matched_indices', {
          count: indices.value.length,
          indices: indexNames
        })
      })

      return {
        matchHint,
        requestState,
        load: debouncedLoad,
        localValue
      }
    }
  }
</script>
