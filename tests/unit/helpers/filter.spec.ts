import { describe, it, expect } from 'vitest'

import { filterItems } from '../../../src/helpers/filters'

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
  { name: 'starfighter', type: 'ship' },
  { name: null, type: null },
  { name: null, type: 'weapon' },
  { name: 'grogu', type: null },
  { age: 5 },
  { obj: { _id: -1, id: 1.2, type: undefined, real: false } }
]
const headerNames = ['name', 'type']

describe.concurrent('helpers/filters.ts', () => {
  describe.concurrent('filters.ts default searches', () => {
    it('should return all items on empty search', () => {
      const results = filterItems(items, '', headerNames)
      expect(results).toEqual(items)
    })

    it('should return all items on whitespace search', () => {
      const results = filterItems(items, '   ', headerNames)
      expect(results).toEqual(items)
    })

    it('should return no items on unmatched search', () => {
      const results = filterItems(items, 'xxxxxxxxxxxxxx', headerNames)
      expect(results).toEqual([])
    })

    it('should return all persons on person search', () => {
      const persons = items.filter(item => item.type === 'person')
      const results = filterItems(items, 'person', headerNames)

      expect(results).toEqual(persons)
    })

    it('should match on "da" search', () => {
      const results = filterItems(items, 'da', headerNames)
      const resultNames = results.map(result => result.name)
      const expected = ['dagobah', 'darth vader', 'yoda']
      expect(resultNames).toEqual(expect.arrayContaining(expected))
    })

    it('should match on "dar" search', () => {
      const results = filterItems(items, 'dar', headerNames)
      const resultNames = results.map(result => result.name)
      const expected = ['darth vader']
      expect(resultNames).toEqual(expect.arrayContaining(expected))
    })

    it('should filter all things on s search', () => {
      const expected = ['milenium falcon', 'x-wing', 'starfighter', 'luke skywalker', 'darth vader', 'yoda', 'qui-gon jin', 'coruscant']

      const results = filterItems(items, 's', headerNames)
      const resultNames = results.map(result => result.name)

      expect(resultNames).toEqual(expect.arrayContaining(expected))
    })
  })

  describe.concurrent('filters.ts column searches', () => {
    it('should return all items on empty column search', () => {
      const results = filterItems(items, 'type:', headerNames)
      expect(results).toEqual(items)
    })

    it('should return all items on whitespace column search', () => {
      const results = filterItems(items, 'type:   ', headerNames)
      expect(results).toEqual(items)
    })

    it('should return all persons on type:person search', () => {
      const persons = items.filter(item => item.type === 'person')
      const results = filterItems(items, 'type:person', headerNames)

      expect(results).toEqual(persons)
    })

    it('should filter all ships and persons on type:s search', () => {
      const shipsAndPersons = items.filter(item => ['ship', 'person'].includes(item.type))
      const itemNames = shipsAndPersons.map(item => item.name)

      const results = filterItems(items, 'type:s', headerNames)
      const resultNames = results.map(result => result.name)

      expect(resultNames).toEqual(expect.arrayContaining(itemNames))
    })
  })
})