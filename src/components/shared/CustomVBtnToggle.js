import { VBtnToggle } from 'vuetify/lib'

export default {
  name: 'custom-v-btn-toggle',
  extends: VBtnToggle,
  methods: {
    unregister: function unregister (item) {
      let index = this.items.indexOf(item)
      let value = this.getValue(item, index)
      this.items.splice(index, 1)
      let valueIndex = this.selectedValues.indexOf(value)
      // Items is not selected, do nothing
      if (valueIndex < 0) return

      /**
       * removed the code to reset the value to "undefined", see
       * https://github.com/vuetifyjs/vuetify/blob/dev/src/components/VItemGroup/VItemGroup.ts#L136
       *
       * It's a bug an will hopefully be fixed in the future.
       */

      // If not mandatory, use regular update process
      if (!this.mandatory) {
        return this.updateInternalValue(value)
      }
    }
  }
}
