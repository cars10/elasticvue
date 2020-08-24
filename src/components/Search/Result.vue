<template>
  <tr class="tr--clickable" @click="openDocument">
    <td v-for="key in filteredColumns" :key="key">
      <template v-if="key === '_type'">{{ document[key] || '_doc' }}</template>
      <template v-else>{{ document[key] }}</template>
    </td>
    <td>
      <router-link :class="openDocumentClasses"
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
  export default {
    name: 'Result',
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
    computed: {
      openDocumentClasses () {
        return [
          'v-btn',
          'v-size--default',
          { 'theme--dark': this.$store.state.theme.dark },
          { 'theme--light': !this.$store.state.theme.dark }
        ]
      }
    },
    methods: {
      openDocument () {
        this.$emit('openDocument', { index: this.document._index, type: this.document._type, id: this.document._id })
      }
    }
  }
</script>
