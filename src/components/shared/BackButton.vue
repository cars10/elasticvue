<template>
  <v-btn :to="route" class="ml-a">
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
        default: () => {
          return {
            name: 'Home',
            params: {}
          }
        }
      },
      text: {
        type: String,
        default: 'Back'
      },
      icon: {
        type: String,
        default: 'mdi-chevron-left'
      }
    }
  }
</script>
