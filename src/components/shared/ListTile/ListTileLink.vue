<template>
  <v-list-tile @click="action">
    <v-list-tile-action v-if="icon">
      <v-icon small>{{icon}}</v-icon>
    </v-list-tile-action>
    <v-list-tile-content>
      <v-list-tile-title>{{linkTitle}}</v-list-tile-title>
    </v-list-tile-content>
  </v-list-tile>
</template>

<script>
  export default {
    name: 'list-tile-link',
    props: {
      action: {
        type: Function,
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
