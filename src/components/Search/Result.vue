<template>
  <tr class="tr--clickable" @click="openDocument">
    <td v-for="key in filteredColumns" :key="key">
      <template v-if="key === '_type'">{{ document[key] || '_doc' }}</template>
      <template v-else>{{ renderValue(document[key]) }}</template>
    </td>
    <td>
      <router-link :class="classes"
                   :to="{name: 'Document', params: { index: document._index, type: document._type, id: document._id }}"
                   event=""
                   title="Show"
                   @click.native.prevent="openDocument">
        <div class="v-btn__content">
          Show
        </div>
      </router-link>
    </td>
  </tr>
</template>

<script>
  import { computed } from '@vue/composition-api'
  import store from '@/store'
  import { stringifyJsonBigInt } from '@/helpers/json_parse'

  export default {
    name: 'result',
    props: {
      filteredColumns: {
        default: () => ([]),
        type: Array
      },
      document: {
        default: () => ({}),
        type: Object
      }
    },
    setup (props, context) {
      const classes = computed(() => {
        return [
          'v-btn',
          'v-size--default',
          { 'theme--dark': store.state.theme.dark },
          { 'theme--light': !store.state.theme.dark }
        ]
      })

      const openDocument = () => {
        context.emit('openDocument', {
          index: props.document._index,
          type: props.document._type,
          id: props.document._id
        })
      }

      const renderValue = value => {
        if (typeof value === 'object') {
          return stringifyJsonBigInt(value)
        } else {
          return value
        }
      }

      return {
        classes,
        openDocument,
        renderValue
      }
    }
  }
</script>
