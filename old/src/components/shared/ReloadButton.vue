<template>
  <div class="d-inline-block reload-button">
    <v-btn :id="id" :title="title" class="mr-0" icon small text @click="action">
      <v-icon>mdi-cached</v-icon>
    </v-btn>
    <timer :action="action" :default-setting="defaultSetting"/>
  </div>
</template>

<script>
  import Timer from '@/components/shared/Timer'
  import i18n from '@/i18n'

  export default {
    name: 'reload-button',
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
        default: i18n.t('shared.reload_button.reload')
      },
      defaultSetting: {
        type: [Object, Number],
        default: null
      }
    }
  }
</script>
