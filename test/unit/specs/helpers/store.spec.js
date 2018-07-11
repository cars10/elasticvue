import { mapVuexAccessors } from '@/helpers/store'

describe('helpers/mapVuexAccessors', () => {
  describe('empty args', () => {
    it('returns empty object when no args are passed', () => {
      expect(mapVuexAccessors()).to.eql({})
    })

    it('returns empty object when empty object is passed', () => {
      expect(mapVuexAccessors({})).to.eql({})
    })

    it('returns empty object when empty array is passed', () => {
      expect(mapVuexAccessors([])).to.eql({})
    })

    it('returns empty object when empty namespace object is passed', () => {
      expect(mapVuexAccessors('', {})).to.eql({})
    })
  })

  describe('creates correct output', () => {
    it('returns a correct object when called with states object', () => {
      const states = {search: 'setSearch'}
      const expected = {
        search: {
          get () {
            return this.$store.state['']
          },
          set (value) {
            this.$store.commit('setSearch', value)
          }
        }
      }
      const actual = mapVuexAccessors(states)
      expect(Object.keys(actual)).to.eql(Object.keys(expected))
      expect(Object.keys(actual.search)).to.eql(Object.keys(expected.search))
    })

    it('returns a correct object when called with states array', () => {
      const states = ['search']
      const expected = {
        search: {
          get () {
            return this.$store.state['']
          },
          set (value) {
            this.$store.commit('setSearch', value)
          }
        }
      }
      const actual = mapVuexAccessors(states)
      expect(Object.keys(actual)).to.eql(Object.keys(expected))
      expect(Object.keys(actual.search)).to.eql(Object.keys(expected.search))
    })
  })
})
