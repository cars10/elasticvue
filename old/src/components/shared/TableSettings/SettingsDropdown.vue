<template>
  <div class="settings-dropdown" @click.stop>
    <v-btn :aria-label="buttonTitle" :title="buttonTitle" icon small @click.native="toggleMenu">
      <v-badge :value="badge" class="pa-0 ma-0" color="green" dot>
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
  import { onBeforeUnmount, onMounted, ref } from 'vue'

  export default {
    name: 'settings-dropdown',
    props: {
      badge: {
        type: Boolean,
        default: false
      },
      buttonTitle: {
        type: String,
        default: 'Settings'
      }
    },
    setup () {
      const open = ref(false)
      onMounted(() => {
        window.addEventListener('click', closeMenu)
      })

      onBeforeUnmount(() => {
        window.removeEventListener('click', closeMenu)
      })

      const toggleMenu = () => (open.value = !open.value)
      const closeMenu = () => (open.value = false)

      return {
        open,
        toggleMenu
      }
    }
  }
</script>
