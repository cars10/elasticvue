<template>
  <v-btn :title="title" flat icon @click="action">
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
