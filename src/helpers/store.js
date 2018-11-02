import { capitalize } from './'

/**
 * Generates get() and set() functions for vuex states. It does *not* check if your states and mutations actually exist.
 * Accepts an optional namespace and an object containing the get/set pairs like this:
 * {yourKey: setYourKey}, where `yourKey` is the states name and `setYourKey` is the name of the corresponding mutation.
 *
 * Alternatively pass an array of strings for states, this will generate {yourstring: setYourstring}
 *
 * @example
 *  mapVuexAccessors('search', {filter: 'setFilter'})
 *  // is the same as:
 *  mapVuexAccessors('search', ['filter'])
 * @usage
 *  use in combination with the spread operator ... in your computed properties:
 *  ...,
 *  computed () {
 *    something () {//..},
 *    ...mapVuexAccessors('search', {filter: 'setFilter'})
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

  if (Array.isArray(states)) {
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
  } else {
    Object.keys(states).forEach(function (key) {
      methods[key] = {
        get () {
          /* istanbul ignore next */
          return namespace ? this.$store.state[namespace][key] : this.$store.state[key]
        },
        set (value) {
          /* istanbul ignore next */
          namespace ? this.$store.commit(`${namespace}/${states[key]}`, value) : this.$store.commit(states[key], value)
        }
      }
    })
  }

  return methods
}
