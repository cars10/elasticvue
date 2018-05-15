<template>
  <v-btn flat icon @click="action" :title="title">
    <v-icon>cached</v-icon>
  </v-btn>
</template>

<script>
  export default {
    name: 'ReloadButton',
    props: {
      action: {
        type: Function,
        default: () => {
        }
      },
      title: {
        type: String,
        default: 'Reload'
      }
    }
  }
</script>
