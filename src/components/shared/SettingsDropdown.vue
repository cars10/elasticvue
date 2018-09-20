<template>
  <div class="settings-dropdown">
    <v-btn icon @click.native="toggleMenu">
      <v-badge :value="badge" color="green" overlap>
        <v-icon slot="badge" small>filter_list</v-icon>
        <v-icon>settings</v-icon>
      </v-badge>
    </v-btn>
    <div v-if="open" class="settings-dropdown__dropdown elevation-2">
      <slot>
        <v-flex pa-2><i>Empty</i></v-flex>
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
      window.addEventListener('click', () => {
        this.closeMenu()
      })

      this.$el.addEventListener('click', (e) => {
        e.stopPropagation()
      })
    },
    destroyed () {
      window.removeEventListener('click', () => {
        this.closeMenu()
      })

      this.$el.removeEventListener('click', (e) => {
        e.stopPropagation()
      })
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
