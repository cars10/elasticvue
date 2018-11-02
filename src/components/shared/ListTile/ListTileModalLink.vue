<template>
  <router-link :to="to" class="v-list__tile v-list__tile--link" event="" @click.native.prevent="action">
    <v-list-tile-action v-if="icon">
      <v-icon small>{{icon}}</v-icon>
    </v-list-tile-action>
    <v-list-tile-content>
      <v-list-tile-title>{{linkTitle}}</v-list-tile-title>
    </v-list-tile-content>
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
