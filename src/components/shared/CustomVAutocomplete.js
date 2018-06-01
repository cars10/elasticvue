import VAutocomplete from 'vuetify/es5/components/VAutocomplete'

export default {
  name: 'custom-v-autocomplete',
  extends: VAutocomplete,
  data () {
    return {
      lastItem: 200
    }
  },
  props: {
    maxHeight: {
      default: '385px'
    }
  }
}
