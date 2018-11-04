import { VAutocomplete } from 'vuetify/lib'
import Fuzzysort from 'fuzzysort'

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
      default: '385px',
      type: String
    }
  },
  computed: {
    filteredItems () {
      if (!this.isSearching || this.noFilter || this.internalSearch === null || this.internalSearch === '') return this.allItems
      if (typeof this.allItems[0] === 'object') {
        return Fuzzysort.go(this.internalSearch, this.allItems, { key: this.itemValue }).map(i => i.obj)
      } else {
        return Fuzzysort.go(this.internalSearch, this.allItems).map(i => i.target)
      }
    }
  }
}
