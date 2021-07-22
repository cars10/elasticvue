<template>
  <tr class="tr--clickable" @click.exact="openDoc" @click.ctrl.prevent="openDocNewTab">
    <td v-for="key in filteredColumns" :key="key">
      <template v-if="key === '_type'">{{ doc[key] || '_doc' }}</template>
      <template v-else>{{ renderValue(doc[key]) }}</template>
    </td>
    <td>
      <router-link :class="classes"
                   :to="{name: 'Document', params: { index: doc._index, type: doc._type, id: doc._id }}"
                   event=""
                   :title="$t('search.result.show')"
                   @click.native.prevent="openDoc">
        <div class="v-btn__content">
          {{ $t('search.result.show') }}
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
      doc: {
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

      const openDoc = () => {
        context.emit('openDocument', {
          index: props.doc._index,
          type: props.doc._type,
          id: props.doc._id
        })
      }

      const openDocNewTab = () => {
        const url = context.root.$router.resolve({
          name: 'Document',
          params: { index: props.doc._index, type: props.doc._type, id: props.doc._id }
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
        classes,
        openDoc,
        renderValue,
        openDocNewTab
      }
    }
  }
</script>
