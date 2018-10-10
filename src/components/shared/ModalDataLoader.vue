<template>
  <div>
    <router-link v-if="isLink"
                 :to="to"
                 :class="linkClasses"
                 :title="activatorTitle"
                 event=""
                 @click.native.prevent="dialog = true">
      <div class="v-btn__content">
        <v-icon v-if="activatorIcon !== ''">{{activatorIcon}}</v-icon>
        <span v-if="activatorText !== ''">{{activatorText}}</span>
      </div>
    </router-link>

    <v-btn v-else :title="activatorTitle" :flat="flat" @click.prevent="dialog = true">
      <v-icon v-if="activatorIcon !== ''">{{activatorIcon}}</v-icon>
      <span v-if="activatorText !== ''">{{activatorText}}</span>
    </v-btn>

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

        <v-card-text class="pt-0">
          <h2 class="subheading">{{modalSubtitle}}</h2>
        </v-card-text>

        <data-loader ref="dataLoader" :method="method" :method-params="methodParams">
          <template slot-scope="data">
            <slot name="content">
              <print-pretty :document="data.body" :resizable="false" :initial-height="calculatedHeight()"/>
            </slot>
          </template>
        </data-loader>
      </v-card>
    </v-dialog>
  </div>
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
      to: {
        default: '',
        type: [Object, String]
      },
      activatorTitle: {
        default: '',
        type: String
      },
      modalTitle: {
        default: 'Show',
        type: String
      },
      modalSubtitle: {
        default: '',
        type: String
      },
      activatorText: {
        default: '',
        type: String
      },
      activatorIcon: {
        default: '',
        type: String
      },
      flat: {
        default: false,
        type: Boolean
      }
    },
    data () {
      return {
        dialog: false
      }
    },
    computed: {
      isLink () {
        return this.to !== ''
      },
      linkClasses () {
        return [
          'v-btn',
          'v-btn--router',
          { 'v-btn--flat': this.flat },
          { 'theme--dark': this.$store.state.theme.dark },
          { 'theme--light': !this.$store.state.theme.dark }
        ]
      }
    },
    watch: {
      dialog (value) {
        if (value) {
          window.addEventListener('keydown', this.closeOnEsc)
        } else {
          window.removeEventListener('keydown', this.closeOnEsc)
        }
      }
    },
    beforeDestroy () {
      window.removeEventListener('keydown', this.closeOnEsc)
    },
    methods: {
      calculatedHeight () {
        return window.innerHeight * 0.8
      },
      closeOnEsc (e) {
        if (e.keyCode === 27) {
          this.dialog = false
        }
      }
    }
  }
</script>
