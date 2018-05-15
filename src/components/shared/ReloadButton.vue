<template>
  <v-btn flat icon :class="classes" @click="action" :title="title">
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
      },
      alignLeft: Boolean
    },
    computed: {
      classes () {
        return {'ml-a': !this.alignLeft}
      }
    }
  }
</script>
