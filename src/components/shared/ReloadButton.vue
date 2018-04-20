<template>
  <v-btn flat icon :class="classes" @click="action" :title="title">
    <v-icon>cached</v-icon>
  </v-btn>
</template>

<script>
  export default {
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
