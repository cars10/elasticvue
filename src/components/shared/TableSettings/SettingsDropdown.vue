<template>
  <div class="settings-dropdown" @click.stop>
    <v-btn small icon @click.native="toggleMenu">
      <v-badge :value="badge" color="green" overlap>
        <v-icon slot="badge" small>mdi-filter-variant</v-icon>
        <v-icon>mdi-settings</v-icon>
      </v-badge>
    </v-btn>
    <div v-if="open" class="settings-dropdown__dropdown elevation-2">
      <slot>
        <v-col class="pa-2"><i>Empty</i></v-col>
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
