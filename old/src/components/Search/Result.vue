<template>
  <tr class="tr--clickable" @click.exact="openDoc" @click.ctrl.prevent="openDocNewTab">
    <td v-for="key in filteredColumns" :key="key">
      <template v-if="key === '_type'">{{ doc[key] || '_doc' }}</template>
      <template v-else>{{ renderValue(doc[key]) }}</template>
    </td>
    <td>
      <v-btn>{{ $t('search.result.show') }}</v-btn>
    </td>
  </tr>
</template>

<script>
  import { stringifyJsonBigInt } from '@/helpers/json_parse'
  import { useRouter } from '@/helpers/composition'

  export default {
    name: 'result',
    props: {
      filteredColumns: {
        default: () => ([]),
        type: Array
      },
      doc: {
        default: () => ({}),
        type: Object
      }
    },
    setup (props, context) {
      const openDoc = () => {
        context.emit('openDocument', {
          index: props.doc._index,
          type: props.doc._type,
          id: props.doc._id,
          routing: props.doc._routing
        })
      }

      const { router } = useRouter()

      const openDocNewTab = () => {
        const url = router.resolve({
          name: 'Document',
          params: { index: props.doc._index, type: props.doc._type, id: props.doc._id, routing: props.doc._routing }
        }).href
        window.open(url, '_blank')
      }

      const renderValue = value => {
        if (typeof value === 'object') {
          return stringifyJsonBigInt(value)
        } else {
          return value
        }
      }

      return {
        openDoc,
        renderValue,
        openDocNewTab
      }
    }
  }
</script>
