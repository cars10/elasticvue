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

    <modal-data-loader :width="width"
                       :method="method"
                       :method-params="methodParams"
                       :modal-title="modalTitle"
                       :modal-subtitle="modalSubtitle"
                       v-model="dialog"/>
  </div>
</template>

<script>
  import ModalDataLoader from '@/components/shared/ModalDataLoader'

  export default {
    name: 'modal-data-loader-activator',
    components: {
      ModalDataLoader
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
    }
  }
</script>
