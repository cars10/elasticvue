<template>
  <router-link :to="to" class="v-list-item v-list-item--link" event="" @click.native.prevent="action">
    <v-list-item-action v-if="icon">
      <v-icon small>{{ icon }}</v-icon>
    </v-list-item-action>
    <v-list-item-content>
      <v-list-item-title>{{ linkTitle }}</v-list-item-title>
    </v-list-item-content>
  </router-link>
</template>

<script>
  export default {
    name: 'list-tile-modal-link',
    props: {
      action: {
        type: Function,
        default: () => {
        }
      },
      to: {
        type: Object,
        default: () => {
        }
      },
      icon: {
        type: String,
        default: ''
      },
      linkTitle: {
        type: String,
        default: ''
      }
    }
  }
</script>
