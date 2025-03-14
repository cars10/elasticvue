import { describe, it, expect } from 'vitest'

import { sortableField } from '../../../src/helpers/search'
import { DEFAULT_SORTABLE_COLUMNS } from '../../../src/consts'

describe.concurrent('helpers/search.ts', () => {
  describe.concurrent('search.ts sortableField', () => {
    it('should return column name for all default sortable columns', () => {
      for (const column of DEFAULT_SORTABLE_COLUMNS) {
        expect(sortableField(column, null)).toBe(column)
      }
    })

    it('should return null when fieldName is not a default sortable column name and property is falsy', () => {
      for (const falsyProperty of [null, undefined, 0, '', false, NaN]) {
        expect(sortableField('non-default sortable column', falsyProperty)).toBe(null)
      }
    })

    it('should return fieldName when property.type is a sortable type', () => {
      for (const type of ['long', 'integer', 'double', 'float', 'date', 'boolean', 'keyword']) {
        const property = { type }

        expect(sortableField('random fieldName', property)).toBe('random fieldName')
      }
    })

    it('should return fieldName with \'.keyword\' appended when property.fields.keyword is truthy', () => {
      const property = {
        fields: {
          keyword: 'some value'
        }
      }

      expect(sortableField('random fieldName', property)).toBe('random fieldName.keyword')
    })

    it('should return fieldName with \'.keyword\' appended when property.fields.keyword is truthy', () => {
      const property = {
        fields: {
          keyword: 'some value'
        }
      }

      expect(sortableField('random fieldName', property)).toBe('random fieldName.keyword')
    })

    it('should return fieldName appended with subfield type when subfield type is sortable', () => {
      for (const type of ['long', 'integer', 'double', 'float', 'date', 'boolean', 'keyword']) {
        const property = {
          fields: {
            a: {
              type
            },
            b: 2
          }
        }

        expect(sortableField('random fieldName', property)).toBe('random fieldName.a')
      }
    })

    it('should return null when subfield type is non-sortable', () => {
      const property = {
        fields: {
          a: {
            type: 'non-sortable type'
          }
        }
      }

      expect(sortableField('random fieldName', property)).toBe(null)
    })

    it('should return property has fields but none of them have a type', () => {
      const property = {
        fields: {
          a: {},
          b: {}
        }
      }

      expect(sortableField('random fieldName', property)).toBe(null)
    })
  })
})