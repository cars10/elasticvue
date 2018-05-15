<template>
  <v-btn :to="route" :class="classes">
    <v-icon>{{icon}}</v-icon>
    {{text}}
  </v-btn>
</template>

<script>
  export default {
    name: 'BackButton',
    props: {
      route: {
        type: Object,
        default: {
          name: 'Home',
          params: {}
        }
      },
      text: {
        type: String,
        default: 'Back'
      },
      icon: {
        type: String,
        default: 'keyboard_arrow_left'
      },
      alignLeft: {
        type: Boolean
      }
    },
    computed: {
      classes () {
        return {'ml-a': !this.alignLeft}
      }
    }
  }
</script>
