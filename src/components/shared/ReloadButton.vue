<template>
  <div class="d-inline-block reload-button">
    <v-btn :title="title" :id="id" flat icon @click="action">
      <v-icon>cached</v-icon>
    </v-btn>
    <timer :action="action" :default-setting="defaultSetting"/>
  </div>
</template>

<script>
  import Timer from '@/components/shared/Timer'

  export default {
    name: 'ReloadButton',
    components: {
      Timer
    },
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
      },
      defaultSetting: {
        type: [Object, Number],
        default: null
      }
    }
  }
</script>
