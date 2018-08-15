<template>
  <v-btn :title="title" :id="id" flat icon @click="action">
    <v-icon>cached</v-icon>
  </v-btn>
</template>

<script>
  export default {
    name: 'ReloadButton',
    props: {
      id: {
        type: String,
        default: 'reload-button'
      },
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
