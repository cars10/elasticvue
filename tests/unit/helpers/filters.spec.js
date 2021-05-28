import { filterItems } from '@/helpers/filters'

const items = [
  { name: 'x-wing', type: 'ship' },
  { name: 'darth vader', type: 'person' },
  { name: 'milenium falcon', type: 'ship' },
  { name: 'luke skywalker', type: 'person' },
  { name: 'tatooine', type: 'location' },
  { name: 'qui-gon jin', type: 'person' },
  { name: 'coruscant', type: 'location' },
  { name: 'yoda', type: 'person' },
  { name: 'dagobah', type: 'location' },
  { name: 'starfighter', type: 'ship' }
]
const headers = [
  { value: 'name' },
  { value: 'type' }
]

describe('helpers/filters.js', () => {
  describe('filters.js default searches', () => {
    it('should return all items on empty search', () => {
      const results = filterItems(items, '', headers)
      expect(results.length).toEqual(items.length)
    })

    it('should return all items on whitespace search', () => {
      const results = filterItems(items, '   ', headers)
      expect(results.length).toEqual(items.length)
    })

    it('should return no items on unmatched search', () => {
      const results = filterItems(items, 'xxxxxxxxxxxxxx', headers)
      expect(results).toEqual([])
    })

    it('should return all persons on person search', () => {
      const persons = items.filter(item => item.type === 'person')
      const personNames = persons.map(person => person.name).sort()

      const results = filterItems(items, 'person', headers)
      const resultNames = results.map(result => result.name).sort()

      expect(results.length).toEqual(persons.length)
      expect(resultNames).toEqual(expect.arrayContaining(personNames))
    })

    it('should fuzzy match on "da" search', () => {
      const results = filterItems(items, 'da', headers)
      const resultNames = results.map(result => result.name)
      const expected = ['dagobah', 'darth vader', 'yoda']
      expect(resultNames).toEqual(expect.arrayContaining(expected))
    })

    it('should fuzzy match on "dar" search', () => {
      const results = filterItems(items, 'dar', headers)
      const resultNames = results.map(result => result.name)
      const expected = ['darth vader']
      expect(resultNames).toEqual(expect.arrayContaining(expected))
    })

    it('should filter all things on s search', () => {
      const expected = ['milenium falcon', 'x-wing', 'starfighter', 'luke skywalker', 'darth vader', 'yoda', 'qui-gon jin', 'coruscant']

      const results = filterItems(items, 's', headers)
      const resultNames = results.map(result => result.name)

      expect(resultNames).toEqual(expect.arrayContaining(expected))
    })
  })

  describe('filters.js column searches', () => {
    it('should return all items on empty column search', () => {
      const results = filterItems(items, 'type:', headers)
      expect(results.length).toEqual(items.length)
    })

    it('should return all items on whitespace column search', () => {
      const results = filterItems(items, 'type:   ', headers)
      expect(results.length).toEqual(items.length)
    })

    it('should return all persons on type:person search', () => {
      const persons = items.filter(item => item.type === 'person')
      const personNames = persons.map(person => person.name)

      const results = filterItems(items, 'type:person', headers)
      const resultNames = results.map(result => result.name)

      expect(results.length).toEqual(persons.length)
      expect(resultNames).toEqual(expect.arrayContaining(personNames))
    })

    it('should filter all ships and persons on type:s search', () => {
      const shipsAndPersons = items.filter(item => item.type !== 'location')
      const itemNames = shipsAndPersons.map(item => item.name)

      const results = filterItems(items, 'type:s', headers)
      const resultNames = results.map(result => result.name)

      expect(resultNames).toEqual(expect.arrayContaining(itemNames))
    })
  })
})
