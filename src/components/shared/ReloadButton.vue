<template>
  <div class="d-inline-block reload-button">
    <v-btn :title="title" :id="id" flat icon @click="action">
      <v-icon>cached</v-icon>
    </v-btn>
    <v-select :items="timerSettings"
              v-model="timerSetting"
              item-value="value"
              item-text="text"
              hide-details
              class="mt-0 pt-0 d-inline-block"/>
  </div>
</template>

<script>
  export default {
    name: 'ReloadButton',
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
      timerSettings: {
        type: Array,
        default: () => {
          return [
            { text: 'None', value: null },
            { text: '5s', value: 5 },
            { text: '15s', value: 15 },
            { text: '30s', value: 30 },
            { text: '60s', value: 60 }
          ]
        }
      }
    },
    data () {
      return {
        timerSetting: null,
        intervalID: null
      }
    },
    watch: {
      timerSetting (value) {
        clearInterval(this.intervalID)
        if (value) this.setInterval()
      }
    },
    destroyed () {
      clearInterval(this.intervalID)
    },
    methods: {
      setInterval () {
        this.intervalID = setInterval(() => {
          this.action.call()
        }, this.timerSetting * 1000)
      }
    }
  }
</script>
