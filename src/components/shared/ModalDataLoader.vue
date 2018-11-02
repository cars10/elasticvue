<template>
  <v-dialog v-model="dialog" :width="width" lazy>
    <v-card>
      <v-card-title>
        <h2 class="headline">{{modalTitle}}</h2>
        <div class="ml-a">
          <v-btn icon @click.native="dialog = false">
            <v-icon>close</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <data-loader ref="dataLoader" :method="method" :method-params="methodParams">
        <template slot-scope="data">
          <slot name="content">
            <print-pretty :document="data.body"
                          :resizable="false"
                          :initial-height="calculatedHeight()"
                          :caption="modalSubtitle"/>
          </slot>
        </template>
      </data-loader>
    </v-card>
  </v-dialog>
</template>

<script>
  import DataLoader from '@/components/shared/DataLoader'
  import PrintPretty from '@/components/shared/PrintPretty'

  export default {
    name: 'modal-data-loader',
    components: {
      DataLoader,
      PrintPretty
    },
    props: {
      width: {
        type: String,
        default: '1000'
      },
      method: {
        type: String,
        default: ''
      },
      methodParams: {
        default: () => {
          return {}
        },
        type: Object
      },
      modalTitle: {
        default: 'Show',
        type: String
      },
      modalSubtitle: {
        default: '',
        type: String
      },
      value: {
        default: false,
        type: Boolean
      }
    },
    data () {
      return {
        dialog: false
      }
    },
    watch: {
      dialog (value) {
        if (value) {
          if (this.$refs.dataLoader) this.$refs.dataLoader.loadData()
          window.addEventListener('keydown', this.closeOnEsc)
        } else {
          window.removeEventListener('keydown', this.closeOnEsc)
          this.$emit('input', value)
        }
      },
      value (value) {
        if (value) this.open()
      }
    },
    beforeDestroy () {
      window.removeEventListener('keydown', this.closeOnEsc)
    },
    methods: {
      open () {
        this.dialog = true
      },
      calculatedHeight () {
        return window.innerHeight * 0.7
      },
      closeOnEsc (e) {
        if (e.keyCode === 27) {
          this.dialog = false
        }
      }
    }
  }
</script>
