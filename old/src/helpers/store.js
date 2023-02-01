import { capitalize } from './'
import { computed } from 'vue'
import store from '@/store'

export const vuexAccessors = function (namespace, states) {
  const methods = {}

  states.forEach(function (key) {
    methods[key] = computed(
      {
        get: () => {
          return store.state[namespace][key]
        },
        set: value => {
          const capitalizedKey = capitalize(key)
          store.commit(`${namespace}/set${capitalizedKey}`, value)
        }
      }
    )
  })

  return methods
}
