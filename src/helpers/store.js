import { capitalize } from './'

/**
 * Generates get() and set() functions for vuex states. It does *not* check if your states and mutations actually exist.
 * Pass an array of strings for states, this will generate {yourstring: setYourstring}
 *
 * @example
 *  mapVuexAccessors('search', ['filter'])
 * @usage
 *  use in combination with the spread operator ... in your computed properties:
 *  ...,
 *  computed () {
 *    something () {//..},
 *    ...mapVuexAccessors('search', ['filter'])
 *  },
 *  ...
 * @param namespace (optional)
 * @param states {Object|Array}
 */
export const mapVuexAccessors = function (namespace, states) {
  if (typeof namespace === 'undefined') return {}
  if (typeof namespace === 'object') {
    states = namespace
    namespace = undefined
  }

  let methods = {}

  states.forEach(function (key) {
    methods[key] = {
      get () {
        /* istanbul ignore next */
        return namespace ? this.$store.state[namespace][key] : this.$store.state[key]
      },
      set (value) {
        /* istanbul ignore next */
        let capitalizedKey = capitalize(key)
        /* istanbul ignore next */
        if (namespace) {
          /* istanbul ignore next */
          this.$store.commit(`${namespace}/set${capitalizedKey}`, value)
        } else {
          /* istanbul ignore next */
          this.$store.commit(`set${capitalizedKey}`, value)
        }
      }
    }
  })

  return methods
}
