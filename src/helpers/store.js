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
          return namespace ? this.$store.state[namespace][key] : this.$store.state[key]
        },
        set (value) {
          let capitalizedKey = capitalize(key)
          if (namespace) {
            this.$store.commit(`${namespace}/set${capitalizedKey}`, value)
          } else {
            this.$store.commit(`set${capitalizedKey}`, value)
          }
        }
      }
    })
  } else {
    Object.keys(states).forEach(function (key) {
      methods[key] = {
        get () {
          return namespace ? this.$store.state[namespace][key] : this.$store.state[key]
        },
        set (value) {
          namespace ? this.$store.commit(`${namespace}/${states[key]}`, value) : this.$store.commit(states[key], value)
        }
      }
    })
  }

  return methods
}
