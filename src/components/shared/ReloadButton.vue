<template>
  <div class="d-inline-block reload-button">
    <v-btn :id="id" :title="title" class="mr-0" icon text @click="action">
      <v-icon>mdi-cached</v-icon>
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
