<template>
  <div class="d-inline-block" title="Auto reload">
    <v-select v-model="timerSetting"
              :items="timerSettings"
              class="mt-0 pt-0 d-inline-block v-select--dense-append"
              hide-details
              item-text="text"
              item-value="value">
      <template slot="selection" slot-scope="{ item, index }">
        <small v-if="item.value">{{ item.text }}</small>
      </template>
    </v-select>
  </div>
</template>

<script>
  import { onBeforeUnmount, ref, watch } from '@vue/composition-api'

  export default {
    name: 'timer',
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
    setup (props) {
      const timerSetting = ref(null)
      const intervalID = ref(null)

      const createInterval = () => {
        intervalID.value = setInterval(() => {
          props.action.call()
        }, timerSetting.value * 1000)
      }
      const destroyInterval = () => {
        clearInterval(intervalID.value)
        intervalID.value = null
      }

      watch(timerSetting, newValue => {
        destroyInterval()
        if (newValue) createInterval()
      })

      if (props.defaultSetting && process.env.NODE_ENV !== 'development') {
        timerSetting.value = props.defaultSetting
        props.action.call()
      }

      onBeforeUnmount(destroyInterval)

      return {
        timerSetting
      }
    }
  }
</script>
