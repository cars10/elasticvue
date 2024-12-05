import { describe, it, expect } from 'vitest'

import { genColumns } from '../../../src/helpers/tableColumns'

describe.concurrent('helpers/tableColumns.ts', () => {
  describe.concurrent('tableColumns.ts genColumns', () => {
    it('should return empty array when supplied with an empty array', () => {
      expect(genColumns([])).toStrictEqual([])
    })

    it('should map all options in the input array', () => {
      const options = [
        {
          label: 'label value 1',
          field: 'field value 1',
          align: 'align value 1'
        },
        {
          label: 'label value 2',
          field: 'field value 2',
          align: 'align value 2'
        }
      ]

      expect(genColumns(options)).toStrictEqual([
        {
          label: 'label value 1',
          field: 'field value 1',
          name: 'field value 1',
          sortable: true,
          align: 'align value 1'
        },
        {
          label: 'label value 2',
          field: 'field value 2',
          name: 'field value 2',
          sortable: true,
          align: 'align value 2'
        }
      ])
    })
  
    it('should set sortable to false when field is undefined or an empty string', () => {
      const options = [
        {
          label: 'label value 1',
          field: undefined,
          align: 'align value 1'
        },
        {
          label: 'label value 2',
          field: '',
          align: 'align value 2'
        }
      ]
  
      expect(genColumns(options)).toStrictEqual([
        expect.objectContaining({
          field: undefined,
          name: undefined,
          sortable: false
        }),
        expect.objectContaining({
          field: '',
          name: '',
          sortable: false
        })
      ])
    })    
  
    it('should set align to \'left\' when undefind or an empty string', () => {
      const options = [
        {
          label: 'label value 1',
          field: 'field value 1',
          align: undefined
        },
        {
          label: 'label value 2',
          field: 'field value 2',
          align: ''
        }
      ]
    
      expect(genColumns(options)).toStrictEqual([
        expect.objectContaining({
          align: 'left'
        }),
        expect.objectContaining({
          align: 'left'
        })
      ])
    })
  })
})