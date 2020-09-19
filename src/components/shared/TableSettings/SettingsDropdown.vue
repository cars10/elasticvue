<template>
  <div class="settings-dropdown" @click.stop>
    <v-btn small icon @click.native="toggleMenu">
      <v-badge :value="badge" color="green" class="pa-0 ma-0" dot>
        <v-icon>mdi-cog</v-icon>
      </v-badge>
    </v-btn>
    <div v-if="open" class="settings-dropdown__dropdown pt-2 elevation-2">
      <slot>
        <div class="pa-2"><i>Empty</i></div>
      </slot>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'settings-dropdown',
    props: {
      badge: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        open: false
      }
    },
    mounted () {
      window.addEventListener('click', this.closeMenu)
    },
    destroyed () {
      window.removeEventListener('click', this.closeMenu)
    },
    methods: {
      toggleMenu () {
        this.open = !this.open
      },
      closeMenu () {
        this.open = false
      }
    }
  }
</script>
