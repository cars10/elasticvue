<template>
  <div class="d-inline-block" title="Auto reload">
    <v-select :items="timerSettings"
              v-model="timerSetting"
              class="mt-0 pt-0 d-inline-block v-select--dense-append"
              hide-details
              item-text="text"
              item-value="value">
      <template slot="selection" slot-scope="{ item, index }">
        <small v-if="item.value">{{item.text}}</small>
      </template>
    </v-select>
  </div>
</template>

<script>
  export default {
    name: 'Timer',
    props: {
      action: {
        type: Function,
        default: () => {
        }
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
      },
      defaultSetting: {
        type: [Object, Number],
        default: null
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
        this.destroyInterval()
        if (value) this.createInterval()
      }
    },
    created () {
      if (this.defaultSetting && process.env.NODE_ENV !== 'development') {
        this.timerSetting = this.defaultSetting
        this.action.call()
      }
    },
    destroyed () {
      this.destroyInterval()
    },
    methods: {
      createInterval () {
        this.intervalID = setInterval(() => {
          this.action.call()
        }, this.timerSetting * 1000)
      },
      destroyInterval () {
        clearInterval(this.intervalID)
        this.intervalID = null
      }
    }
  }
</script>
