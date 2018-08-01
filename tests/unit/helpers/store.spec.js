import { mapVuexAccessors } from '@/helpers/store'

describe('helpers/mapVuexAccessors', () => {
  describe('empty args', () => {
    it('returns empty object when no args are passed', () => {
      expect(mapVuexAccessors()).toEqual({})
    })

    it('returns empty object when empty object is passed', () => {
      expect(mapVuexAccessors({})).toEqual({})
    })

    it('returns empty object when empty array is passed', () => {
      expect(mapVuexAccessors([])).toEqual({})
    })

    it('returns empty object when empty namespace object is passed', () => {
      expect(mapVuexAccessors('', {})).toEqual({})
    })
  })

  describe('creates correct output without namespace', () => {
    it('returns a correct object when called with states object', () => {
      const states = {search: 'setSearch'}
      const expected = {
        search: {
          get () {
            return this.$store.state['search']
          },
          set (value) {
            this.$store.commit('setSearch', value)
          }
        }
      }
      const actual = mapVuexAccessors(states)
      expect(Object.keys(actual)).toEqual(Object.keys(expected))
      expect(Object.keys(actual.search)).toEqual(Object.keys(expected.search))
    })

    it('returns a correct object when called with states array', () => {
      const states = ['search']
      const expected = {
        search: {
          get () {
            return this.$store.state['search']
          },
          set (value) {
            this.$store.commit('setSearch', value)
          }
        }
      }
      const actual = mapVuexAccessors(states)
      expect(Object.keys(actual)).toEqual(Object.keys(expected))
      expect(Object.keys(actual.search)).toEqual(Object.keys(expected.search))
    })
  })

  describe('creates correct output with namespace', () => {
    it('returns a correct object when called with states object', () => {
      const namespace = 'search'
      const state = 'filter'
      const stateUpcase = 'Filter'
      const states = {[state]: `set${stateUpcase}`}
      const expected = {
        [state]: {
          get () {
            return this.$store.state[namespace][state]
          },
          set (value) {
            this.$store.commit(`${namespace}/set${stateUpcase}`, value)
          }
        }
      }
      const actual = mapVuexAccessors(namespace, states)
      expect(Object.keys(actual)).toEqual(Object.keys(expected))
      expect(Object.keys(actual.filter)).toEqual(Object.keys(expected.filter))
    })

    it('returns a correct object when called with states array', () => {
      const namespace = 'search'
      const state = 'filter'
      const stateUpcase = 'Filter'
      const states = ['filter']
      const expected = {
        [state]: {
          get () {
            return this.$store.state[namespace][state]
          },
          set (value) {
            this.$store.commit(`${namespace}/set${stateUpcase}`, value)
          }
        }
      }
      const actual = mapVuexAccessors(namespace, states)
      expect(Object.keys(actual)).toEqual(Object.keys(expected))
      expect(Object.keys(actual.filter)).toEqual(Object.keys(expected.filter))
    })
  })
})
